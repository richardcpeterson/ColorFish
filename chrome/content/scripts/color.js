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
}

/**
 * Test for color equality.  If this color has a special string then
 * that is all we compare.  Otherwise we compare RGB values.
 */
Color.prototype.equals = function (otherColor) {
    //If either color has a special string, then that color's rgb values
    //can be considered meaningless. Therefore if either color has a
    //special string, we compare based only on special string equality.
    if (this.specialString || otherColor.specialString) {
        return (this.specialString === otherColor.specialString);
    }

    //If neither color has a special string, they are both RGB colors.
    //We compare them  based in RGB equality
    return (this.red   === otherColor.red &&
            this.green === otherColor.green &&
            this.blue  === otherColor.blue);
};

/**
 * Return a new Color with the same color value as this Color
 */
Color.prototype.clone = function () {
    var cloned = new Color();
    cloned.red = this.red;
    cloned.green = this.green;
    cloned.blue = this.blue;
    cloned.specialString = this.specialString;
    return cloned;
};

/***
 * Sets the component values by reading an 'rgb(...)' string.
 */
Color.prototype.read_rgb = function (rgb) {
    var match   = Color.rgbPattern.exec(rgb);

    if (match) {
        this.red   = parseInt( match[1] );
        this.green = parseInt( match[2] );
        this.blue  = parseInt( match[3] );
    }
};

/**
 * Sets the value of this color by reading a hex color rule, like
 * '#FFFFFF' or '#FFF'
 */
Color.prototype.read_hex = function (hex) {
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
};

/**
 * Return the number in the string format #FFFFFF
 */
Color.prototype.getCSSHex = function () {
    var r = this.padHex(this.red.toString(16));
    var g = this.padHex(this.green.toString(16));
    var b = this.padHex(this.blue.toString(16));
    return "#"+r+g+b;
};

/**
 * Return a string of the form #FFF if possible. If not, fall back to
 * long hex - #ABCDEF
 */
Color.prototype.getCSSShortHex = function () {
    var str = this.getCSSHex();
    if (str.charAt(1)==str.charAt(2)
        && str.charAt(3)==str.charAt(4)
        && str.charAt(5)==str.charAt(6)){
        str = "#"+str.charAt(1)+str.charAt(3)+str.charAt(5);
    }
    return str;
};

/**
 * Return the number in the string format rgb(255,255,255)
 */
Color.prototype.getCSSRGB = function () {
    return "rgb("
        + this.red + ","
        + this.green + ","
        + this.blue + ")";
};

/**
 * Return the color name for this color if it exists, otherwise
 * return undefined.
 */
Color.prototype.getColorName = function () {
    var thisHex = this.getCSSHex().substr(1,6).toLowerCase();
    for (let [name, hex] in Iterator(Color.colorNames)) {
        if (hex === thisHex) {
            return name;
        }
    }
};

/**
 * Return a string representation of this color, in a parsable
 * format. Takes an optional color format from Enums.colorFormats.
 */
Color.prototype.toString = function (colorFormat) {
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
};

/**
 * Return an array of Hue, Saturation and Lightness values
 */
Color.prototype.getHSL = function ()  {
    //Convert to 0-1 scale
    var r = this.red / 255;
    var g = this.green / 255;
    var b = this.blue / 255;

    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var hue;
    var saturation;
    var lightness = (max + min) / 2;

    if(max == min){ //grayscale
        hue = -1;
        saturation = -1;
    }
    else{
        var delta = max - min;

        //Set saturation
        saturation = ((lightness > 0.5) ? (delta / (2 - max - min)) : (delta / (max + min)));

        //Set hue depending on which of r,g,b is the maximum
        switch(max){
        case r:
            hue = (g - b) / delta + (g < b ? 6 : 0);
            break;
        case g:
            hue = (b - r) / delta + 2;
            break;
        case b:
            hue = (r - g) / delta + 4;
            break;
        }
        hue /= 6;
    }

    return [hue, saturation, lightness];
};

Color.prototype.getHSV = function ()  {
    //Convert to 0-1 scale
    var r = this.red / 255;
    var g = this.green / 255;
    var b = this.blue / 255;

    //Get the minimum and maximum values and the
    //interval between them
    var min = Math.min(r, g, b);
    var max = Math.max(r, g, b);
    var delta = max - min;

    var hue, saturation, value;

    //Value is always the max value of RGB
    value = max;

    if (delta == 0) {
        //Greyscale
        hue = 0;
        saturation = 0;
    } else{
        saturation = delta / max;

        //Calculate the hue
        var rDelta = (((max - r) / 6) + (delta / 2)) / delta;
        var gDelta = (((max - g) / 6) + (delta / 2)) / delta;
        var bDelta = (((max - b) / 6) + (delta / 2)) / delta;

        switch(max){
        case r:
            hue = bDelta - gDelta;
            break;
        case g:
            hue = (1 / 3) + rDelta - bDelta;
            break;
        case b:
            hue = (2 / 3) + gDelta - rDelta;
            break;
        }

        //Make sure hue is in the 0 to 1 range
        if (hue < 0){
            hue += 1;
        }
        if (hue > 1){
            hue -= 1;
        }
    }

    //Scale back to degrees
    hue *= 360;

    return [hue, saturation, value];
};
    
/**
 * Gets the color in HCL color space as defined in the research report:
 *
 * HCL: a new Color Space for a more Effective Content-based Image Retrieval
 * M. Sarifuddin <m.sarifuddin@uqo.ca> - Rokia Missaoui <rokia.missaoui@uqo.ca> Département d'informatique et d'ingénierie, Université du Québec en Outaouais C.P. 1250, Succ. B Gatineau Quéebec Canada, J8X 3X7
 * http://w3.uqo.ca/missaoui/Publications/TRColorSpace.zip
 *
 * HCL offers tunable parameters. This function uses color tunings
 * compatible with the CPAN module implementation:
 * Color::Similarity::HCL
 * http://search.cpan.org/~mbarbon/Color-Similarity-HCL-0.04/lib/Color/Similarity/HCL.pm#rgb2hcl
 * 
 * This color space is designed to allow more accurate comparison
 * of the perceptual distance between two colors.
 * 
 * Returns an array in the form [Hue, Chroma, Luminance]
 *
 * Note: Hue, Chroma and Luminance have different definitions in
 * HCL than in the HSV, HSL, L*u*v, L*a*b* or other color spaces.
 * Values from HCL are not synonymous with values from other color
 * spaces - even Hue values.
 */
Color.prototype.getHCL = function() {
    //return saved HCL value if available and up to date
    if (this.hclCache){
        if (   this.hclCache.red == this.red
               && this.hclCache.green == this.green
               && this.hclCache.blue ==  this.blue){
            return this.hclCache.hcl;
        }
    }
    //Cache the current rgb values so we can save future HCL
    //calculations
    this.hclCache = {};
    this.hclCache.red = this.red;
    this.hclCache.green = this.green;
    this.hclCache.blue = this.blue;
    
    //Shorthand for correlation to the published math formulas
    var r = this.red;
    var g = this.green;
    var b = this.blue;
    
    var min = Math.min(r, g, b);
    var max = Math.max(r, g, b);
    
    if (max == 0){
        //Black - skip the calculations...
        this.hclCache.hcl = [0,0,0];
        return [0,0,0];
    }
    
    var Y0 = 100;
    var gamma = 20;

    var alpha = (min / max) / Y0;
    var Q = Math.exp(alpha * gamma);

    var rg = r-g;
    var gb = g-b;
    var br = b-r;
    
    var L = ((Q * max) + (Q - 1) * min) / 2;
    
    var C = (Q * (Math.abs(rg) + Math.abs(gb) + Math.abs(br))) / 3;
    var H = Math.atan(gb / rg) * (180 / Math.PI);
    
    if (rg >= 0 && gb >= 0){
        H = (2 / 3) * H ;
    }
    if (rg >= 0 && gb < 0){
        H = (4 / 3) * H;
    }
    if (rg < 0 && gb >= 0){
        H = 180 + ((4 / 3) * H);
    }
    if (rg < 0 && gb < 0){
        H = ((2 / 3) * H) - 180;
    }
    if (isNaN(H)){
        H = 0;
    }
    
    this.hclCache.hcl = [H, C, L];

    return [H, C, L];
};

/**
 * Returns the distance between this color and another color in
 * HCL color space, as defined in the research report:
 *
 * HCL: a new Color Space for a more Effective Content-based Image Retrieval
 * M. Sarifuddin <m.sarifuddin@uqo.ca> - Rokia Missaoui <rokia.missaoui@uqo.ca> Département d'informatique et d'ingénierie, Université du Québec en Outaouais C.P. 1250, Succ. B Gatineau Quéebec Canada, J8X 3X7
 * http://w3.uqo.ca/missaoui/Publications/TRColorSpace.zip
 *
 * This uses the "D sub HCL" method, labeled
 * 
 * D
 *  HCL
 */
Color.prototype.HCLDistanceFrom = function(hcl){
    //Accept hcl array or Color object
    if (hcl instanceof Color){
        hcl = hcl.getHCL();
    }
    
    var hcl2 = this.getHCL();
    
    var H1 = hcl[0];
    var C1 = hcl[1];
    var L1 = hcl[2];
    
    var H2 = hcl2[0];
    var C2 = hcl2[1];
    var L2 = hcl2[2];
    
    
    var AL = 1.4456;
    
    var DH = Math.abs(H1 - H2);
    if ((C1 == 0 || C2 == 0) && !((C1 == 0 && C2 == 0))){
        DH = 180;
    }
    var ACH = DH + 0.16;
    var DL = Math.abs(L1 - L2);
    
    return Math.sqrt(
        Math.pow((AL * DL),2)
        + ACH * (C1*C1 + C2*C2 - (2*C1*C2*Math.cos(DH * (Math.PI / 180))))
    );
};

Color.prototype.getHue = function () {
    return this.getHSL()[0];
};

Color.prototype.getSaturation = function () {
    return this.getHSL()[1];
};

Color.prototype.getLightness = function ()  {
    return this.getHSL()[2];
};

/**
 * Pad a hex value to make sure it is (at least) 2 digits
 */
Color.prototype.padHex = function (hex) {
    while (hex.length < 2) {
        hex = "0" + hex;
    }
    return hex;
};

/***
 * Dumps debugging output to the console.
 */
Color.prototype.dump = function () {
    if(this.specialString)
        dump(specialString);
    else
        dump([this.red, this.green, this.blue].join(','));
};

/***
 * This function takes a CSS color string and returns a new Color
 * object representing that color.
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
