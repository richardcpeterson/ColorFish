/**
 * Swatch class.  A reference to a color and all
 * CSS color properties associated with that color.
 */

function Swatch(color){
    this.color = color;
    
    //An array of color properties
    this.properties = new Array();
    
    /**
     * Update all properties in this swatch to reflect
     * the value in this.color
     */
    this.updateProperties = function(){
        var hexColor = this.color.toString();
        for(var i = 0; i < this.properties.length; i++){
            this.properties[i].setColor(hexColor);
        }
    }
    
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

/**
 * Compare the hue of one swatch to another.
 * if hue(s1)>hue(s2), returns positive.
 * if hue(s1)<hue(s2), returns negative.
 * if hue(s1)==hue(s2), returns 0
 */
Swatch.compareHue = function(s1, s2){
    var s1hue = s1.color.getHue();
    var s2hue = s2.color.getHue();
    return ((s1hue<s2hue)?-1:((s1hue>s2hue)?1:0));
}

/**
 * Compare the hue of one swatch to another.
 * if hue(s1)>hue(s2), returns positive.
 * if hue(s1)<hue(s2), returns negative.
 * if hue(s1)==hue(s2), returns the comparison of
 *    lightness by the same rules.
 * if hue and lightness are equal, than returns 0.
 */
Swatch.compareHueAndLightness = function(s1, s2){
    var s1hue = s1.color.getHue();
    var s2hue = s2.color.getHue();
    var s1lightness = s1.color.getLightness();
    var s2lightness = s2.color.getLightness();
    return (
        //Here's a fun one for you...
        (s1hue<s2hue)? //if
            -1
        :( //else
            (s1hue>s2hue)? //if
                1
            :( //else
                (s1lightness<s2lightness)? //if
                    -1
                :( //else
                    (s1lightness>s2lightness)?1:0
                )
            )
        )
    );
}