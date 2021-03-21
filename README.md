# Panzoom [![version](https://img.shields.io/badge/version-0.9-yellow.svg)](https://semver.org)

A small ES6 module to add simple panning and zooming functionality to any DOM element. It Includes cascading containers and the possibility of bounds (inner or outer). Handle touch events on touch devices.

## Demos
You can see here some [demos](https://cmorillas.github.io/panzoom/).

## Usage
Import from an ES6 module and initialize after DOMContentLoaded event.
```html
<script type="module">
  import {panzoom} from 'https://github.com/cmorillas/panzoom/src/panzoom.js';
  document.addEventListener("DOMContentLoaded", (e) => {
    panzoom('#element');
  });
</script>
```
## Options
`PanzoomOptions`
panzoom(

Markdown is a lightweight and easy-to-use syntax for styling your writing. It includes conventions for

```markdown
Syntax highlighted code block

# Header 1
## Header 2
### Header 3

- Bulleted
- List

1. Numbered
2. List

**Bold** and _Italic_ and `Code` text

[Link](url) and ![Image](src)
```

For more details see [GitHub Flavored Markdown](https://guides.github.com/features/mastering-markdown/).

### Jekyll Themes

Your Pages site will use the layout and styles from the Jekyll theme you have selected in your [repository settings](https://github.com/cmorillas/test/settings). The name of this theme is saved in the Jekyll `_config.yml` configuration file.

### Support or Contact

Having trouble with Pages? Check out our [documentation](https://docs.github.com/categories/github-pages-basics/) or [contact support](https://support.github.com/contact) and we’ll help you sort it out.
