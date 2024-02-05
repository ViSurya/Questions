// Create a script element
var script = document.createElement('script');

// Set the type and async attributes
script.type = 'text/javascript';
script.async = true;

// Set the source URL for MathJax library
script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';

// Set the id attribute
script.id = 'MathJax-script';

// Append the script element to the document's head
document.head.appendChild(script);
