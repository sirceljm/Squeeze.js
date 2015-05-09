# Squeeze.js

Squeeze.js is a Javascript utility that figures out the font size that is just big enough to fit your paragraph or word into required dimensions. There are a lot of such algorithms out there but what makes this one different is its performance.

The algorithm was primarily required to make text adjustments on mobile devices for 20 or 30 text boxes at once which caused other methods to lag too much.

The standard algorithm would set a high font size through CSS and then check if the box that text produces is smaller than the container box. Then if it isn't it would decrease the font size by one and repeat. Although this works very well, it is very CPU consuming.

## Squeeze.js is different in two ways:

 - it doesn't change the font size through CSS during the computation process, but it uses precalculated dimensions for each character
 - it decreases or increases the size in logarithmic way and not linearly which usually requires about eight steps to figure out the correct font size

## [Demo](http://squeeze.s-media.si/test_it_out.html)
## [Installation and usage](http://squeeze.s-media.si/how_to_use.html)
## [Font dimensions generator](http://squeeze.s-media.si/font_dimensions_generator.html)
