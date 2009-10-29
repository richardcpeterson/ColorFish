/***
 * A class for representing and manipulating color values extracted
 * from CSS rules.
 */

function Color() {

    /***
     * Our color components.
     */
    this.red   = 0;
    this.green = 0;
    this.blue  = 0;

    /***
     * Sets the component values by reading an 'rgb(...)' string.
     */
    this.read_rgb = function(rgb) {
        var pattern = /^rgb\(\s*(\d+?),\s*(\d+?),\s*(\d+?)\s*\)$/;
        var match   = pattern.exec(rgb);

        if (match) {
            this.red   = parseInt( match[1] );
            this.green = parseInt( match[2] );
            this.blue  = parseInt( match[3] );
        }
    }
    
    /**
     * Return the number in the string format
     * #FFFFFF
     */
    this.getCSSHex = function(){
        var r = this.padHex(this.red.toString(16));
        var g = this.padHex(this.green.toString(16));
        var b = this.padHex(this.blue.toString(16));
        return "#"+r+g+b;
    }
    
    /**
     * Return the number in the string format
     * rgb(255,255,255)
     */
    this.getCSSRGB = function(){
        return "rgb("
            + this.red + ","
            + this.green + ","
            + this.blue + ")";
    }
    
    /**
     * Pad a hex value to make sure it is (at least)
     * 2 digits
     */
    this.padHex = function(hex){
        while (hex.length < 2) {
            hex = "0" + hex;
        }
        return hex;
    }

    /***
     * Dumps debugging output to the console.
     */
    this.dump = function() {
        dump([this.red, this.green, this.blue].join(','));
    }

}

/***
 * This function takes a CSS color rule in the form of a string and
 * returns a new Color object representing that color.
 */
Color.from_css = function(rule) {
    var color = new Color();

    if ( rule.match( /^rgb\(/ ) ) {
        color.read_rgb(rule);
    }

    return color;
}