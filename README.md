# Panzoom [![version](https://img.shields.io/badge/version-0.9-yellow.svg)](https://semver.org)

A small ES6 module to add simple panning and zooming functionality to any DOM element. It Includes cascading containers and the possibility of bounds (inner or outer). Handle touch events on touch devices. Only for modern borwsers.

## Demos
You can see here some [demos](https://cmorillas.github.io/panzoom/).

## Installation
Import from an ES6 module and initialize after DOMContentLoaded event.
```html
<script type="module">
  import {panzoom} from 'https://cdn.jsdelivr.net/gh/cmorillas/panzoom/src/panzoom.js';
  document.addEventListener("DOMContentLoaded", (e) => {
    panzoom('#element');
  });
</script>
```
## Usage
panzoom(`Selector`, `Options`);
| Parameter | Type | Description |
| :---        |:---    |:--- |
| `Selector` | String | [CSS Selector](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors) |
| `Options` | Object | Initialization options |

## Options
| Name | Possible Values | Default Value | Description |
| :--- |:---: |:---: |:---|
| _`pan`_ | true \| false | true | do panning |
| _`zoom`_ | true \| false | true | do Zooming |
| _`bound`_ | 'inner' \| 'outer' \| 'none' | 'inner' | containment whitin the parent container |
| _`wheel_step`_ | 0.01 - 0.4 | 0.2 | mouse wheel speed |
| _`scale_min`_ | 0.01 - 20 | 0.01 | minimum zoom |
| _`scale_max`_ | 0.01 - 20 | 10 | maximum zoom |

## Example
```html
<!doctype html>
<html lang="en">
<head>
  <script type="module">
    import {panzoom} from 'https://github.com/cmorillas/panzoom/src/panzoom.js';
    document.addEventListener("DOMContentLoaded", (e) => {
      panzoom('#element');
    });
  </script>
</head>
<body>
  
</body>
</html>
```
See the above code in action at https://codepen.io/taye/pen/tCKAms
## License
panzoom.js is released under the GPL-3.0 License.
