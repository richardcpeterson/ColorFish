/**
 * Swatch class.  A reference to a color and all
 * CSS color properties associated with that color.
 */

function Swatch(color){
    this.color = color;

    this.undoList = new Array();
    this.redoList = new Array();


    //An array of color properties
    this.properties = new Array();

    /**
     * Update all properties in this swatch to reflect
     * the value in this.color
     */
    this.updateProperties = function(newColor){
        newColor = Color.from_css(newColor);
        if ( !this.undoList.top() || ( this.color.getCSSRGB() != newColor.getCSSRGB()) ) {
            this.undoList.push(new Array(this.color, Color.getFormat(this.color)));
            this.color = newColor;
            for(var i = 0; i < this.properties.length; i++) {
                 this.properties[i].setColor(this.color);
            }
        }
    }

    this.undoProperties = function() {
        if (this.undoList.top()) {
            this.redoList.push( this.color );
            this.color = this.undoList.top()[0];
            this.format
            for(var i = 0; i < this.properties.length; i++) {
                this.properties[i].setColor(this.color);
            }
        }
        // TODO: will need to save the user's entered format and then reformat this value to match
        return this.color.toString();
    };

    /**
     * Add a color property to this swatch
     */
    this.addProperty = function(newProperty){
        this.properties.push(newProperty);
    }

    /**
     * Return number of references in this swatch
     */
    this.count = function(){
        return this.properties.length;
    }
}

/***
 * Takes two numbers.  The return value is:
 *
 *   1  if  x > y
 *  -1  if  x < y
 *   0  if  x = y
 *
 * This makes it more convenient to write functions below for
 * comparing hue and lightness.
 */
Swatch.compareNumbers = function(x, y) {
    return (
        (x > y) ? 1 : (x < y) ? -1 : 0
    );
}


/**
 * Compare the hue of one swatch to another.
 * if hue(s1)>hue(s2), returns positive.
 * if hue(s1)<hue(s2), returns negative.
 * if hue(s1)==hue(s2), returns 0
 */
Swatch.compareHue = function(s1, s2) {
    return Swatch.compareNumbers(
        s1.color.getHue(),
        s2.color.getHue()
    );
}

/**
 * Compare the hue of one swatch to another.
 * if hue(s1)>hue(s2), returns positive.
 * if hue(s1)<hue(s2), returns negative.
 * if hue(s1)==hue(s2), returns the comparison of
 *    lightness by the same rules.
 * if hue and lightness are equal, than returns 0.
 */
Swatch.compareHueAndLightness = function(s1, s2) {
    return Swatch.compareHue(s1, s2) || Swatch.compareNumbers(
        s1.color.getLightness(),
        s2.color.getLightness()
    );
}