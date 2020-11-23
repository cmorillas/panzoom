window.onload = () => {
	//var cesar=
	var intentos = 10
	var num = document.querySelector("#hola");
	var initentos = document.querySelector("#initentos");
	var menor = document.querySelector("#menor");
	var mayor = document.querySelector("#mayor");
	var ganaste = document.querySelector("#ganaste");
	var numero=Math.floor(Math.random()*100)+1;




	//al apretar el boton
	function apretar(tecla){
		//console.log(keyCode);
		var enter = tecla.keyCode;
		alert(String.fromCharCode(enter+1) );
		if(enter == 13){
			
			//intentos
			intentos = intentos-1;
			initentos.innerHTML =intentos;
			if(intentos == 0){
				alert("lo siento has perdido tras 10 intentos. El numero era"+numero+"por favor recarga la pagina");
			}
			//si es mayor menor o igual		
			if(parseInt (num.value) > numero){
				menor.innerHTML="mi numero es menor";
			}if (parseInt (num.value) < numero){
				menor.innerHTML="mi numero es mayor";
			}if (parseInt (num.value) == numero){
				alert("adivinaste¡¡¡");
			}			
		}

	}


	//acabar de hacer la funcion de enter

//window.onkeydown = apretar;
window.addEventListener('keydown', apretar);


	//contar el tiempo
	var segundos = 0;
	function tiempo () {
	segundos = segundos + 1;
	var temp = document.querySelector("#tiempo");
	temp.innerHTML = 'han pasado: '+segundos+' segundos';

}















//m();
//function m() {
	//alert('Hola César');
//}




		
		//if(parseInt (num.value) > numero){
			//menor.innerHTML="mi numero es menor";
		//}if (parseInt (num.value) < numero){
			//menor.innerHTML="mi numero es mayor";
		//}if (parseInt (num.value) == numero){
			//alert("adivinaste¡¡¡");




			var btn1 = document.querySelector("#cesar");
//	var hola = "te quedan";

//	var intentos = 0;
//	btn1.addEventListener("click", function() {

		
		

		
		
	//});

	btn1.addEventListener("click", hablamago);
	setInterval(tiempo, 1000);
}
//};