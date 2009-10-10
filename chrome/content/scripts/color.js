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