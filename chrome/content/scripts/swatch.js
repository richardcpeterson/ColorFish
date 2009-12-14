/**
 * Swatch class.  A reference to a color and all
 * CSS color properties associated with that color.
 */

function Swatch(color, colorFormat){
    this.color = color;
    
    //Use colorFormat if given, or default value
    this.format =
        (colorFormat?
         colorFormat:
         Enums.ColorFormats.longHex);

    this.undoList = new Array();
    this.redoList = new Array();


    //An array of color properties
    this.properties = new Array();

    /**
     * Update all properties in this swatch to reflect
     * the value passed in color. This does not create
     * a new Swatch state to modify the undo stack.
     * It DOES set this swatch's current color.
     * This is a transient action.
     * color may be a valid CSS color string or a
     * Color object.
     */
    this.updateColor = function(color){
        if (typeof color == "string")
            color = Color.from_css(color);
        this.color = color;
        for(var i = 0; i < this.properties.length; i++) {
            this.properties[i].setColor(this.color);
        }
    }
    
    /**
     * Sets the color of the current swatch, setting
     * an undo-able Swatch state.
     * Both parameters are optional. If newColor
     * is given, it will opdate all properties for
     * that color. If colorFormat is given, it will
     * use the new color format. If neither
     * parameter is given, the current values in
     * the swatch will be used, and a new Swatch
     * state will be created from these values. So
     * for instance, you could use
     * updateProperties(color)
     * several times, and use
     * setColor() with no arguments to set an undoable
     * swatch state with the current swatch properties.
     */
    this.setColor = function(newColor, colorFormat) {
        //Push the old state onto the undo stack
        this.undoList.push(new Array(this.color, this.format) );
        
        //Update properties and color format if needed
        if (newColor){
            this.updateColor(newColor);
        }
        if (colorFormat){
            this.format = colorFormat;
        }
        
        //Clear the redo list - this wasn't an undone
        //command
		this.redoList = new Array();
    }

    /**
     * Undo the most recent setColor action
     */
    this.undo = function() {
        if (this.undoList.top()) {
            //Save the current state in the redo stack
            this.redoList.push(new Array(this.color, this.format));
            this.updateColor(this.undoList.top()[0]);
            this.format = this.undoList.top()[1];
            this.undoList.pop();
        }
    };
    
    /**
     * Redo the most recently undone setColor action
     */
    this.redo = function() {
        if (this.redoList.top()) {
            //Save the current state in the undo stack
            this.undoList.push(new Array(this.color, this.format));
            this.updateColor(this.redoList.top()[0]);
            this.format = this.redoList.top()[1];
            this.redoList.pop();
        }
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