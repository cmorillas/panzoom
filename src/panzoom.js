export const panzoom = (selector, options={}) => {

	// Default Parameters
	const pan = options.pan !== false;
	const zoom = options.zoom !== false;		// Default: true	
	const bound = (['inner','outer','none'].includes(options.bound)) ? options.bound : 'inner';
	const wheel_step = (options.wheel_step>0.01 && options.wheel_step<4) ? options.wheel_step : 0.2;
	const scale_min = (options.scale_min>0.01 && options.scale_min<20) ? options.scale_min : 0.01;
	const scale_max = (options.scale_max>0.01 && options.scale_max<20) ? ( (options.scale_max>scale_min) ? options.scale_max : scale_min ) : 10;
	
	// For panning (translate)
	let lastPosX, lastPosY;					// Needed because of decimals 
	let posX_min, posY_min, posX_max, posY_max;
	let parentScale; 						// Needed for avoid calculate every pointermove
	let vvpScale, dprScale;			// Needed to take into account e.movementX in touch screens

	// For touching devies
	let lastTouchX, lastTouchY;		// To calculate delta position when moving fingers
	let isPinching = false;
	let isTouching = false;
	let pinch_dist1;

	// Attach event listeners
	document.querySelectorAll(':scope '+selector).forEach( (elem) => {
		let isValid = normalize(elem);
		if(!isValid) return;
		if(zoom) {
			elem.addEventListener("wheel", handle_wheel, {passive: false});
		} 
		if(pan) {
			// Touch events, needed for pinch/zoom 
			elem.addEventListener("touchstart", handle_touchstart);
			elem.addEventListener("touchmove", handle_touchmove);
			elem.addEventListener("touchend", handle_touchend);

			// Pointer events, needed for move
			elem.addEventListener("pointerdown", handle_pointerdown);
			elem.addEventListener("pointerup", handle_pointerup);
			elem.addEventListener("pointermove", handle_pointermove);
			//elem.addEventListener("pointercancel", handle_pointerup);
			//elem.addEventListener("pointerout", handle_pointerup);
			//elem.addEventListener("pointerleave", handle_pointerup);			

			//elem.addEventListener("gotpointercapture", handle_gotpointercapture);	// Not needed for now
		}			
	});

	function normalize(elem) {
		const width = elem.offsetWidth;
		const widthp = elem.parentNode.offsetWidth;
		const height = elem.offsetHeight;
		const heightp = elem.parentNode.offsetHeight;

		if(width>widthp)
		if(bound=="inner" && (width>widthp || height>heightp)) {
			console.error("panzoom() error: In the 'inner' mode, with or height must be smaller than its container (parent)");
			return false;
		}
		else if(bound=="outer" && (width<widthp || height<heightp)) {
			console.error("panzoom() error: In the 'outer' mode, with or height must be larger than its container (parent)");
			return false;	
		}

		//const {x:x, y:y, width:bwidth, height:bheight} = elem.getBoundingClientRect();
		//const {x:px, y:py, width:bpwidth, height:bpheight} = elem.parentNode.getBoundingClientRect();
		
		/* Incomplete conditionals
		if(bound=="inner" && (elem.offsetX<0 || elem.offsetX+width>elem.parentNode.offsetWidth )) { //|| y<py || y>py-bheight)) {
			console.log(x,px, px-bwidth, y, py, bheight);
			console.error("panzoom() id:"+elem.id+" error: In the 'inner' mode, element positioning must not be out of its container");
			return false;
		}		
		*/

		elem.style.position = 'absolute';		
		elem.style.removeProperty('margin');
		elem.style.backgroundSize = 'cover';
		//elem.style.transition = 'all 0.1s ease 0s';
		return true;
	}

	function do_move(elem, deltaX, deltaY) {

		lastPosX += deltaX;		// Needed because of decimals
		lastPosY += deltaY;		// Needed because of decimals

		if(bound !== 'none') {
			lastPosX = Math.min(Math.max(posX_min, lastPosX), posX_max);	// Restrict Pos X
			lastPosY = Math.min(Math.max(posY_min, lastPosY), posY_max);	// Restrict Pos Y	
		}
		
		elem.style.left =  lastPosX + 'px';
		elem.style.top =  lastPosY + 'px';
	}

	function do_zoom(elem, deltaScale, offsetX, offsetY) {
		const matrix = new WebKitCSSMatrix(getComputedStyle(elem).getPropertyValue("transform"));
		const {a:scaleX, b:skewY, c:skewX, d:scaleY, e:translateX, f:translateY} = matrix;
		const {x, y, width, height} = elem.getBoundingClientRect();	
		const {x:xp, y:yp, width:widthp, height:heightp} = elem.parentNode.getBoundingClientRect();

		deltaScale *= scaleX;	// Smooth deltaScale 

		let newScale = scaleX + deltaScale;		// let newScale = scaleX + deltaScale/vvpScale/dprScale;
		
		let posX, posY;
		let maxScaleX,maxScaleY,maxScale;
		let minScaleX,minScaleY,minScale;
		if(bound=='inner') {
			maxScaleX = widthp/elem.offsetWidth;
			maxScaleY = heightp/elem.offsetHeight;
			maxScale = Math.min(maxScaleX, maxScaleY, scale_max);
			if (newScale>maxScale) deltaScale=0;
			newScale = Math.min(Math.max(scale_min, newScale), maxScale);	
		}
		else if(bound=="outer") {					
			minScaleX = widthp/elem.offsetWidth;
			minScaleY = heightp/elem.offsetHeight;
			minScale = Math.max(minScaleX, minScaleY, scale_min);
			if (newScale<minScale || newScale > scale_max) return; //deltaScale=0;
			//posX = elem.offsetWidth/2*(newScale-1)+offsetX/elem.offsetWidth*(elem.parentNode.offsetWidth-elem.offsetWidth) - offsetX*(newScale-1);
			//posY = elem.offsetHeight/2*(newScale-1)+offsetY/elem.offsetHeight*(elem.parentNode.offsetHeight-elem.offsetHeight) - offsetY*(newScale-1);
		}
		else if(bound=='none') {
			if (newScale<scale_min || newScale>scale_max) deltaScale=0;
			newScale = Math.min(Math.max(scale_min, newScale), scale_max);
		}

		posX = elem.offsetLeft + deltaScale*(elem.offsetWidth/2-offsetX);
		posY = elem.offsetTop + deltaScale*(elem.offsetHeight/2-offsetY);

		// Set Position Bounds
		let posX_min, posY_min, posX_max, posY_max;
		if(bound=='inner') {
			posX_min = elem.offsetWidth/2*(newScale-1)-translateX;
			posY_min = elem.offsetHeight/2*(newScale-1)-translateY;
			posX_max = elem.parentNode.offsetWidth-elem.offsetWidth-elem.offsetWidth/2*(newScale-1)-translateX;
			posY_max = elem.parentNode.offsetHeight-elem.offsetHeight-elem.offsetHeight/2*(newScale-1)-translateY;
			posX = Math.min(Math.max(posX_min, posX), posX_max);		// Restrict
			posY = Math.min(Math.max(posY_min, posY), posY_max);		// Restrict
			
		}
		else if(bound=='outer') {
			posX_max = elem.offsetWidth/2*(newScale-1)-translateX;
			posY_max = elem.offsetHeight/2*(newScale-1)-translateY;
			posX_min = elem.parentNode.offsetWidth-elem.offsetWidth-elem.offsetWidth/2*(newScale-1)-translateX;
			posY_min = elem.parentNode.offsetHeight-elem.offsetHeight-elem.offsetHeight/2*(newScale-1)-translateY;
			posX = Math.min(Math.max(posX_min, posX), posX_max);		// Restrict
			posY = Math.min(Math.max(posY_min, posY), posY_max);		// Restrict
		}
		else if(bound=='none') {

		}		

		const transform = `matrix(${newScale}, ${skewY}, ${skewX}, ${newScale}, ${translateX}, ${translateY})`;	
		elem.style.transform = transform;

		elem.style.left =  posX + 'px';
		elem.style.top =  posY + 'px';
	}

	function handle_pointerdown(e) {
		if(e.target !== e.currentTarget) return;
		e.preventDefault();
		e.stopPropagation();		

		vvpScale = window.visualViewport.scale;		// It's pinch default gesture zoom (Android). Ignore in Desktop
		dprScale = window.devicePixelRatio;			// Needed if e.screenX is used. Ignore in Mobile
		
		// Set Last Element Position. Needed because event offset doesn't have decimals. And decimals will be needed when dragging
		lastPosX = e.target.offsetLeft;
		lastPosY = e.target.offsetTop;

		// Set Position Bounds
		const matrix = new WebKitCSSMatrix(getComputedStyle(e.target).getPropertyValue("transform"));
		const {a:scaleX, b:skewY, c:skewX, d:scaleY, e:translateX, f:translateY} = matrix;
		const scale = scaleX;
	
		// Set Position Bounds
		if(bound == 'inner') {
			posX_min = e.target.offsetWidth/2*(scale-1)-translateX;
			posY_min = e.target.offsetHeight/2*(scale-1)-translateY;
			posX_max = e.target.parentNode.offsetWidth-e.target.offsetWidth-e.target.offsetWidth/2*(scale-1)-translateX;
			posY_max = e.target.parentNode.offsetHeight-e.target.offsetHeight-e.target.offsetHeight/2*(scale-1)-translateY;
		}
		else if(bound == 'outer') {
			posX_max = e.target.offsetWidth/2*(scale-1)-translateX;
			posY_max = e.target.offsetHeight/2*(scale-1)-translateY;
			posX_min = e.target.parentNode.offsetWidth-e.target.offsetWidth-e.target.offsetWidth/2*(scale-1)-translateX;
			posY_min = e.target.parentNode.offsetHeight-e.target.offsetHeight-e.target.offsetHeight/2*(scale-1)-translateY;
		}
	
		const {x:px1, y:py1, width:pwidth1, height:pheight1} = e.target.parentNode.getBoundingClientRect();
		const pwidth2 = e.target.parentNode.offsetWidth;
		parentScale = pwidth1/pwidth2;

		e.target.setPointerCapture(e.pointerId);	// https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
	}

	function handle_pointermove(e) {
		if(e.target !== e.currentTarget) return;
		if(isTouching) return;
		if(!e.target.hasPointerCapture(e.pointerId)) return;
		e.preventDefault();
		e.stopPropagation();

		// Detect when the cursor exits parent node
		//const {x:xp, y:yp, width:widthp, height:heightp} = e.target.parentNode.getBoundingClientRect();
		//if(e.pageX<xp || e.pageX>xp+widthp || e.pageY<yp || e.pageY>yp+heightp) {
			//e.target.releasePointerCapture(e.pointerId);
		//}

		const deltaX = e.movementX/parentScale/dprScale;		// vvpScale It's pinch default gesture zoom (Android). Ignore in Desktop
		const deltaY = e.movementY/parentScale/dprScale;		// vvpScale It's pinch default gesture zoom (Android). Ignore in Desktop

		do_move(e.target, deltaX, deltaY);
		
	}

	function handle_pointerup(e) {
		e.preventDefault();
		e.stopPropagation();
		e.target.releasePointerCapture(e.pointerId);
	}

	function handle_touchstart(e) {		
		if(e.target !== e.currentTarget) return;
		e.preventDefault();
		e.stopPropagation();
		isTouching = true;
		
		// Check if two fingers touched screen. If so, handle Zoom
		if (e.targetTouches.length == 2) {
			isPinching = true;
			pinch_dist1 = Math.hypot( //get rough estimate of distance between two fingers
				e.touches[0].pageX - e.touches[1].pageX,
				e.touches[0].pageY - e.touches[1].pageY
			);
		}

		lastTouchX = e.touches[0].pageX;
		lastTouchY = e.touches[0].pageY;

		// It continues handling pointerdown event
	}

	function handle_touchmove(e) {
		if(e.target !== e.currentTarget) return;
		// Check if two fingers touched screen. If so, handle Zoom
		if(e.targetTouches.length == 2 && e.changedTouches.length == 2) {			
			const distX = e.touches[0].pageX - e.touches[1].pageX;
			const distY = e.touches[0].pageY - e.touches[1].pageY;
			const pinch_dist2 = Math.hypot(	distX,distY); //get rough estimation of new distance between fingers
			const deltaScale = (pinch_dist2-pinch_dist1)/50;
			pinch_dist1 = pinch_dist2;

			const {x, y, width, height} = e.target.getBoundingClientRect();
			//const matrix = new WebKitCSSMatrix(getComputedStyle(e.target).getPropertyValue("transform"));
			//const {a:scaleX, b:skewY, c:skewX, d:scaleY, e:translateX, f:translateY} = matrix;			

			const offsetX0 = (e.touches[0].clientX-x)/width*e.target.offsetWidth;
			const offsetY0 = (e.touches[0].clientY-y)/height*e.target.offsetHeight;
			const offsetX1 = (e.touches[1].clientX-x)/width*e.target.offsetWidth;
			const offsetY1 = (e.touches[1].clientY-y)/height*e.target.offsetHeight;
			//status.innerHTML = e.touches[0].pageX + ' '+x;
			const offsetX = offsetX0+(offsetX1-offsetX0)/2;
			const offsetY = offsetY0+(offsetY1-offsetY0)/2;	

			do_zoom(e.target, deltaScale, offsetX, offsetY);
		}
		else if(e.targetTouches.length == 1 && !isPinching){
			const deltaX = (e.touches[0].pageX-lastTouchX)/parentScale;		// vvpScale It's pinch default gesture zoom (Android). Ignore in Desktop
			const deltaY = (e.touches[0].pageY-lastTouchY)/parentScale;		//
			lastTouchX = e.touches[0].pageX;
			lastTouchY = e.touches[0].pageY;
			// Else, it is a drag. Handle with pointermouse event

			do_move(e.target, deltaX, deltaY);
		}
	}

	function handle_touchend(e) {
		if(e.targetTouches.length==0) {
			isTouching = false;
			isPinching = false;
		}
	}

	function handle_wheel(e) {
		e.preventDefault();
		e.stopPropagation();
		if(e.target !== e.currentTarget) return;
		
		const deltaScale =  e.wheelDelta*wheel_step/120;
		do_zoom(e.target, deltaScale, e.offsetX, e.offsetY);		
	}

	function handle_gotpointercapture(e) {

	}

	return (true);
};