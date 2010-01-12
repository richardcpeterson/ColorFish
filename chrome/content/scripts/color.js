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

    this.specialString = null;

    /**
     * Test for color equality
     */
    this.equals = function(otherColor){
        return (
            //No special string, and color matches
            (    !(this.specialString
                     || otherColor.specialString
                  )
               && otherColor.red == this.red
               && otherColor.green == this.green
               && otherColor.blue == this.blue
            )
            ||
            //Special string defined and equal
            (this.specialString
               &&(otherColor.specialString == this.specialString)
            )
        );
    }
    
    /**
     * Return a new Color with the same color value as
     * this Color
     */
    this.clone = function(){
        var cloned = new Color();
        cloned.red = this.red;
        cloned.green = this.green;
        cloned.blue = this.blue;
        cloned.specialString = this.specialString;
        return cloned;
    }

    /***
     * Sets the component values by reading an 'rgb(...)' string.
     */
    this.read_rgb = function(rgb) {
        var match   = Color.rgbPattern.exec(rgb);

        if (match) {
            this.red   = parseInt( match[1] );
            this.green = parseInt( match[2] );
            this.blue  = parseInt( match[3] );
        }
    }

    /**
     * Sets the value of this color by reading a hex
     * color rule, like '#FFFFFF' or '#FFF'
     */
    this.read_hex = function(hex){
        //Three digits, like #FFF
        if (hex.match( Color.shortHexPattern )) {
            this.red = parseInt(hex.charAt(1).repeat(2),16);
            this.green = parseInt(hex.charAt(2).repeat(2),16);
            this.blue = parseInt(hex.charAt(3).repeat(2),16);
        }
        //Six digits, like #FFFFFF
        else if (hex.match( Color.longHexPattern )) {
            this.red = parseInt(hex.substring(1,3),16);
            this.green = parseInt(hex.substring(3,5),16);
            this.blue = parseInt(hex.substring(5,7),16);
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
     * Return a string of the form
     * #FFF if possible. If not, fall back to
     * long hex - #ABCDEF
     */
    this.getCSSShortHex = function(){
        var str = this.getCSSHex();
        if (str.charAt(1)==str.charAt(2)
            && str.charAt(3)==str.charAt(4)
            && str.charAt(5)==str.charAt(6)){
            str = "#"+str.charAt(1)+str.charAt(3)+str.charAt(5);
        }
        return str;
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
     * Return the color name for this color if it exists,
     * otherwise return long hex (#FFFFFF)
     */
    this.getColorName = function(){
        var thisName = false;
        var thisHex = this.getCSSHex().substr(1,6).toLowerCase();
        for (let [name,hex] in Iterator(Color.colorNames)){  
            if(hex == thisHex){
                thisName = name;
            }
        }
        return thisName;
    }

    /**
     * Return a string representation of this color,
     * in a parsable format. Takes an optional color
     * format from Enums.colorFormats.
     */
    this.toString = function(colorFormat){
        var newString = "";
        if (this.specialString){
            newString = this.specialString;
        }
        else if (colorFormat){
            switch (colorFormat){
                case Enums.ColorFormats.unknown :
                    newString = "unknown";
                    break;
                case Enums.ColorFormats.rgb :
                    newString = this.getCSSRGB();
                    break;
                case Enums.ColorFormats.longHex : 
                    newString = this.getCSSHex();
                    break;
                case Enums.ColorFormats.shortHex : 
                    newString = this.getCSSShortHex();
                    break;
                case Enums.ColorFormats.colorName : 
                    newString = this.getColorName();
                    break;
                case Enums.ColorFormats.specialString :
                    newString = (this.specialString?this.specialString:"unknown");
                    break;
            }
        }
        else{ //Default
            newString = this.getCSSHex();
        }
        return newString;
    }

    /**
     * Return an array of Hue, Saturation and Lightness values
     */
    this.getHSL = function() {
        //Convert to 0-1 scale
        var r = this.red / 255;
        var g = this.green / 255;
        var b = this.blue / 255;

        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var h;
        var s;
        var l = (max + min) / 2;

        if(max == min){ //grayscale
            h = -1;
            s = -1;
        }
        else{
            var d = max - min;

            //Set saturation
            s = ((l > 0.5) ? (d / (2 - max - min)) : (d / (max + min)));

            //Set hue depending on which of r,g,b is the maximum
            switch(max){
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return [h, s, l];
    }

    this.getHue = function(){
        return this.getHSL()[0];
    }

    this.getSaturation = function(){
        return this.getHSL()[1];
    }

    this.getLightness = function() {
        return this.getHSL()[2];
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
        if(this.specialString)
            dump(specialString);
        else
            dump([this.red, this.green, this.blue].join(','));
    }

}

/***
 * This function takes a CSS color string and
 * returns a new Color object representing that color.
 */
Color.from_css = function(colorString) {
    colorString = colorString.toLowerCase();
    var color  = new Color();
    var format = Color.getFormat(colorString);

    switch (format) {
        case Enums.ColorFormats.rgb:
        color.read_rgb(colorString);
        break;

        case Enums.ColorFormats.shortHex:
        case Enums.ColorFormats.longHex:
        color.read_hex(colorString);
        break;

        case Enums.ColorFormats.colorName:
        color.read_hex("#"+Color.colorNames[colorString]);
        break;

        case Enums.ColorFormats.specialString:
        color.specialString = colorString;
        color.read_rgb(Color.specialNames[colorString]);
        break;
    }

    return color;
}

/**
 * Is the given string a known color string format
 * that we can deal with?
 */
Color.isParsableString = function(colorString){
    colorString = colorString.toLowerCase();
    //Use the (?:) in order to
    //return "true" or "false", not just "undefined"
    //or the resulting evaluated boolean (which sometimes)
    //isn't "true" or "false"
    return (
           (colorString.match(Color.rgbPattern)
        || Color.isHexFormat(colorString)
        || Color.colorNames[colorString]
        || Color.specialNames[colorString])?true:false
    );
}

/**
 * Return the Enum.ColorFormat of the given string
 */
Color.getFormat = function(colorString){
    colorString = colorString.toLowerCase();
    if(colorString.match(Color.rgbPattern)){
        return Enums.ColorFormats.rgb;
    }
    if(colorString.match(Color.shortHexPattern)){
        return Enums.ColorFormats.shortHex;
    }
    if(colorString.match(Color.longHexPattern)){
        return Enums.ColorFormats.longHex;
    }
    if(Color.colorNames[colorString]){
        return Enums.ColorFormats.colorName;
    }
    return Enums.ColorFormats.specialString;
}

/**
 * Take a parsable color string and return a new
 * string in the given format representing the
 * same color. This is not guaranteed to return
 * the desired format, as some formats can only
 * represent a subset of the possible colors.
 */
Color.formatColor = function(colorString, colorFormat){
    if (!Color.isParsableString(colorString)){
        return null;
    }
    var newColor = Color.from_css(colorString);
    return newColor.toString(colorFormat);
}

/***
 * Returns a boolean indicating if the given color (string) is in
 * either the hex format #fff or #ffffff;
 */
Color.isHexFormat = function(c) {
    return c.match( Color.shortHexPattern )
        || c.match( Color.longHexPattern );
}

Color.rgbPattern = /^rgb\(\s*(\d+?)\s*,\s*(\d+?)\s*,\s*(\d+?)\s*\)$/;
Color.shortHexPattern = /^#([a-f]|[A-F]|[0-9]){3}$/;
Color.longHexPattern = /^#([a-f]|[A-F]|[0-9]){6}$/;

Color.colorNames = {
    'aliceblue': 'f0f8ff',
    'antiquewhite': 'faebd7',
    'aqua': '00ffff',
    'aquamarine': '7fffd4',
    'azure': 'f0ffff',
    'beige': 'f5f5dc',
    'bisque': 'ffe4c4',
    'black': '000000',
    'blanchedalmond': 'ffebcd',
    'blue': '0000ff',
    'blueviolet': '8a2be2',
    'brown': 'a52a2a',
    'burlywood': 'deb887',
    'cadetblue': '5f9ea0',
    'chartreuse': '7fff00',
    'chocolate': 'd2691e',
    'coral': 'ff7f50',
    'cornflowerblue': '6495ed',
    'cornsilk': 'fff8dc',
    'crimson': 'dc143c',
    'cyan': '00ffff',
    'darkblue': '00008b',
    'darkcyan': '008b8b',
    'darkgoldenrod': 'b8860b',
    'darkgray': 'a9a9a9',
    'darkgreen': '006400',
    'darkkhaki': 'bdb76b',
    'darkmagenta': '8b008b',
    'darkolivegreen': '556b2f',
    'darkorange': 'ff8c00',
    'darkorchid': '9932cc',
    'darkred': '8b0000',
    'darksalmon': 'e9967a',
    'darkseagreen': '8fbc8f',
    'darkslateblue': '483d8b',
    'darkslategray': '2f4f4f',
    'darkturquoise': '00ced1',
    'darkviolet': '9400d3',
    'deeppink': 'ff1493',
    'deepskyblue': '00bfff',
    'dimgray': '696969',
    'dodgerblue': '1e90ff',
    'feldspar': 'd19275',
    'firebrick': 'b22222',
    'floralwhite': 'fffaf0',
    'forestgreen': '228b22',
    'fuchsia': 'ff00ff',
    'gainsboro': 'dcdcdc',
    'ghostwhite': 'f8f8ff',
    'gold': 'ffd700',
    'goldenrod': 'daa520',
    'gray': '808080',
    'green': '008000',
    'greenyellow': 'adff2f',
    'honeydew': 'f0fff0',
    'hotpink': 'ff69b4',
    'indianred': 'cd5c5c',
    'indigo': '4b0082',
    'ivory': 'fffff0',
    'khaki': 'f0e68c',
    'lavender': 'e6e6fa',
    'lavenderblush': 'fff0f5',
    'lawngreen': '7cfc00',
    'lemonchiffon': 'fffacd',
    'lightblue': 'add8e6',
    'lightcoral': 'f08080',
    'lightcyan': 'e0ffff',
    'lightgoldenrodyellow': 'fafad2',
    'lightgrey': 'd3d3d3',
    'lightgreen': '90ee90',
    'lightpink': 'ffb6c1',
    'lightsalmon': 'ffa07a',
    'lightseagreen': '20b2aa',
    'lightskyblue': '87cefa',
    'lightslateblue': '8470ff',
    'lightslategray': '778899',
    'lightsteelblue': 'b0c4de',
    'lightyellow': 'ffffe0',
    'lime': '00ff00',
    'limegreen': '32cd32',
    'linen': 'faf0e6',
    'magenta': 'ff00ff',
    'maroon': '800000',
    'mediumaquamarine': '66cdaa',
    'mediumblue': '0000cd',
    'mediumorchid': 'ba55d3',
    'mediumpurple': '9370d8',
    'mediumseagreen': '3cb371',
    'mediumslateblue': '7b68ee',
    'mediumspringgreen': '00fa9a',
    'mediumturquoise': '48d1cc',
    'mediumvioletred': 'c71585',
    'midnightblue': '191970',
    'mintcream': 'f5fffa',
    'mistyrose': 'ffe4e1',
    'moccasin': 'ffe4b5',
    'navajowhite': 'ffdead',
    'navy': '000080',
    'oldlace': 'fdf5e6',
    'olive': '808000',
    'olivedrab': '6b8e23',
    'orange': 'ffa500',
    'orangered': 'ff4500',
    'orchid': 'da70d6',
    'palegoldenrod': 'eee8aa',
    'palegreen': '98fb98',
    'paleturquoise': 'afeeee',
    'palevioletred': 'd87093',
    'papayawhip': 'ffefd5',
    'peachpuff': 'ffdab9',
    'peru': 'cd853f',
    'pink': 'ffc0cb',
    'plum': 'dda0dd',
    'powderblue': 'b0e0e6',
    'purple': '800080',
    'red': 'ff0000',
    'rosybrown': 'bc8f8f',
    'royalblue': '4169e1',
    'saddlebrown': '8b4513',
    'salmon': 'fa8072',
    'sandybrown': 'f4a460',
    'seagreen': '2e8b57',
    'seashell': 'fff5ee',
    'sienna': 'a0522d',
    'silver': 'c0c0c0',
    'skyblue': '87ceeb',
    'slateblue': '6a5acd',
    'slategray': '708090',
    'snow': 'fffafa',
    'springgreen': '00ff7f',
    'steelblue': '4682b4',
    'tan': 'd2b48c',
    'teal': '008080',
    'thistle': 'd8bfd8',
    'tomato': 'ff6347',
    'turquoise': '40e0d0',
    'violet': 'ee82ee',
    'violetred': 'd02090',
    'wheat': 'f5deb3',
    'white': 'ffffff',
    'whitesmoke': 'f5f5f5',
    'yellow': 'ffff00',
    'yellowgreen': '9acd32'
};




Color.specialNames = new Array();
Color.specialNames["transparent"] = "rgb(0,0,0)";

//TODO: handle this...  Comment this line out
//and browse some sites that have "transparent"
//set as a color...
