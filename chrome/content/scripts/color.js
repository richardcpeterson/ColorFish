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
        if(hex.match(/^#([a-f]|[A-F]|[0-9]){3}$/)){
            this.red = parseInt(hex.charAt(1).repeat(2),16);
            this.green = parseInt(hex.charAt(2).repeat(2),16);
            this.blue = parseInt(hex.charAt(3).repeat(2),16);
        }
        //Six digits, like #FFFFFF
        else if(hex.match(/^#([a-f]|[A-F]|[0-9]){6}$/)){
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
     * Return a string representation of this color,
     * in a parsable format.
     */
    this.toString = function(){
        if (this.specialString)
            return this.specialString;
        else
            return this.getCSSHex();
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
 * This function takes a CSS color rule in the form of a string and
 * returns a new Color object representing that color.
 */
Color.from_css = function(rule) {
    var color = new Color();

    //rgb(255,255,255)  format
    if ( rule.match( Color.rgbPattern ) ) {
        color.read_rgb(rule);
    }
    
    //#FFFFFF or #FFF format
    else if(rule.match( Color.hexPattern )) {
        color.read_hex(rule);
    }
    
    //color name (ie "red")
    else if(Color.colorNames[rule]){
        color.read_rgb(Color.colorNames[rule])
    }
    else{
        //There are lots of other cases, like
        //"transparent", or "-moz-use-text-color"
        //that we aren't prepared to handle
        
        if(rule == "transparent"){
            color.specialString = rule;
            color.read_rgb(Color.specialNames[rule]);
        }
        
        //throw "Could not read color " + rule;
    }

    return color;
}

/**
 * Is the given string a known color string format
 * that we can deal with?
 */
Color.isParsableString = function(colorString){
    //Use the (?:) in order to
    //return "true" or "false", not just "undefined"
    //or the resulting evaluated boolean (which sometimes)
    //isn't "true" or "false"
    return (
           (colorString.match(Color.rgbPattern)
        || colorString.match(Color.hexPattern)
        || Color.colorNames[colorString]
        || Color.specialNames[colorString])?true:false
    );
}

/**
 * Return the Enum.ColorFormat of the given string
 */
Color.getFormat = function(colorString){
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

Color.rgbPattern = /^rgb\(\s*(\d+?)\s*,\s*(\d+?)\s*,\s*(\d+?)\s*\)$/;
Color.hexPattern = /^#([a-f]|[A-F]|[0-9]){3}(([a-f]|[A-F]|[0-9]){3})?$/;
Color.shortHexPattern = /^#([a-f]|[A-F]|[0-9]){3}$/;
Color.longHexPattern = /^#([a-f]|[A-F]|[0-9]){6}$/;

Color.colorNames = new Array();
Color.colorNames["aliceblue"] = "rgb(240,248,255)";  
Color.colorNames["antiquewhite"] = "rgb(250,235,215)";  
Color.colorNames["aqua"] = "rgb(0,255,255)";  
Color.colorNames["aquamarine"] = "rgb(127,255,212)"; 
Color.colorNames["azure"] = "rgb(240,255,255)"; 
Color.colorNames["beige"] = "rgb(245,245,220)"; 
Color.colorNames["bisque"] = "rgb(255,228,196)"; 
Color.colorNames["black"] = "rgb(0,0,0)"; 	 
Color.colorNames["blanchedalmond"] = "rgb(255,235,205)"; 
Color.colorNames["blue"] = "rgb(0,0,255)"; 
Color.colorNames["blueviolet"] = "rgb(138,43,226)"; 
Color.colorNames["brown"] = "rgb(165,42,42)"; 
Color.colorNames["burlywood"] = "rgb(222,184,135)"; 
Color.colorNames["cadetblue"] = "rgb(95,158,160)"; 
Color.colorNames["chartreuse"] = "rgb(127,255,0)"; 
Color.colorNames["chocolate"] = "rgb(210,105,30)"; 
Color.colorNames["coral"] = "rgb(255,127,80)"; 
Color.colorNames["cornflowerblue"] = "rgb(100,149,237)"; 
Color.colorNames["cornsilk"] = "rgb(255,248,220)"; 
Color.colorNames["crimson"] = "rgb(220,20,60)"; 
Color.colorNames["cyan"] = "rgb(0,255,255)"; 
Color.colorNames["darkblue"] = "rgb(0,0,139)"; 
Color.colorNames["darkcyan"] = "rgb(0,139,139)"; 
Color.colorNames["darkgoldenrod"] = "rgb(184,134,11)"; 
Color.colorNames["darkgray"] = "rgb(169,169,169)"; 
Color.colorNames["darkgreen"] = "rgb(0,100,0)"; 
Color.colorNames["darkkhaki"] = "rgb(189,183,107)"; 
Color.colorNames["darkmagenta"] = "rgb(139,0,139)"; 
Color.colorNames["darkolivegreen"] = "rgb(85,107,47)"; 
Color.colorNames["darkorange"] = "rgb(255,140,0)"; 
Color.colorNames["darkorchid"] = "rgb(153,50,204)"; 
Color.colorNames["darkred"] = "rgb(139,0,0)"; 
Color.colorNames["darksalmon"] = "rgb(233,150,122)"; 
Color.colorNames["darkseagreen"] = "rgb(143,188,143)"; 
Color.colorNames["darkslateblue"] = "rgb(72,61,139)"; 
Color.colorNames["darkslategray"] = "rgb(47,79,79)"; 
Color.colorNames["darkturquoise"] = "rgb(0,206,209)"; 
Color.colorNames["darkviolet"] = "rgb(148,0,211)"; 
Color.colorNames["deeppink"] = "rgb(255,20,147)"; 
Color.colorNames["deepskyblue"] = "rgb(0,191,255)"; 
Color.colorNames["dimgray"] = "rgb(105,105,105)"; 
Color.colorNames["dodgerblue"] = "rgb(30,144,255)"; 
Color.colorNames["firebrick"] = "rgb(178,34,34)"; 
Color.colorNames["floralwhite"] = "rgb(255,250,240)"; 
Color.colorNames["forestgreen"] = "rgb(34,139,34)"; 
Color.colorNames["fuchsia"] = "rgb(255,0,255)"; 
Color.colorNames["gainsboro"] = "rgb(220,220,220)"; 
Color.colorNames["ghostwhite"] = "rgb(248,248,255)"; 
Color.colorNames["gold"] = "rgb(255,215,0)"; 
Color.colorNames["goldenrod"] = "rgb(218,165,32)"; 
Color.colorNames["gray"] = "rgb(128,128,128)"; 
Color.colorNames["green"] = "rgb(0,128,0)"; 
Color.colorNames["greenyellow"] = "rgb(173,255,47)"; 
Color.colorNames["honeydew"] = "rgb(240,255,240)"; 
Color.colorNames["hotpink"] = "rgb(255,105,180)"; 
Color.colorNames["indianred"] = "rgb(205,92,92)"; 
Color.colorNames["indigo"] = "rgb(75,0,130)"; 
Color.colorNames["ivory"] = "rgb(255,255,240)"; 
Color.colorNames["khaki"] = "rgb(240,230,140)"; 
Color.colorNames["lavender"] = "rgb(230,230,250)"; 
Color.colorNames["lavenderblush"] = "rgb(255,240,245)"; 
Color.colorNames["lawngreen"] = "rgb(124,252,0)"; 
Color.colorNames["lemonchiffon"] = "rgb(255,250,205)"; 
Color.colorNames["lightblue"] = "rgb(173,216,230)"; 
Color.colorNames["lightcoral"] = "rgb(240,128,128)"; 
Color.colorNames["lightcyan"] = "rgb(224,255,255)"; 
Color.colorNames["lightgoldenrodyellow"] = "rgb(250,250,210)"; 
Color.colorNames["lightgrey"] = "rgb(211,211,211)"; 
Color.colorNames["lightgreen"] = "rgb(144,238,144)"; 
Color.colorNames["lightpink"] = "rgb(255,182,193)"; 
Color.colorNames["lightsalmon"] = "rgb(255,160,122)"; 
Color.colorNames["lightseagreen"] = "rgb(32,178,170)"; 
Color.colorNames["lightskyblue"] = "rgb(135,206,250)"; 
Color.colorNames["lightslategray"] = "rgb(119,136,153)"; 
Color.colorNames["lightsteelblue"] = "rgb(176,196,222)"; 
Color.colorNames["lightyellow"] = "rgb(255,255,224)"; 
Color.colorNames["lime"] = "rgb(0,255,0)"; 
Color.colorNames["limegreen"] = "rgb(50,205,50)"; 
Color.colorNames["linen"] = "rgb(250,240,230)"; 
Color.colorNames["magenta"] = "rgb(255,0,255)"; 
Color.colorNames["maroon"] = "rgb(128,0,0)"; 
Color.colorNames["mediumaquamarine"] = "rgb(102,517,170)"; 
Color.colorNames["mediumblue"] = "rgb(0,0,205)"; 
Color.colorNames["mediumorchid"] = "rgb(186,85,211)"; 
Color.colorNames["mediumpurple"] = "rgb(147,112,216)"; 
Color.colorNames["mediumseagreen"] = "rgb(60,179,113)"; 
Color.colorNames["mediumslateblue"] = "rgb(123,104,238)"; 
Color.colorNames["mediumspringgreen"] = "rgb(0,250,154)"; 
Color.colorNames["mediumturquoise"] = "rgb(72,209,204)"; 
Color.colorNames["mediumvioletred"] = "rgb(199,21,133)"; 
Color.colorNames["midnightblue"] = "rgb(25,25,112)"; 
Color.colorNames["mintcream"] = "rgb(245,255,250)"; 
Color.colorNames["mistyrose"] = "rgb(255,228,225)"; 
Color.colorNames["moccasin"] = "rgb(255,228,181)"; 
Color.colorNames["navajowhite"] = "rgb(255,222,173)"; 
Color.colorNames["navy"] = "rgb(0,0,128)"; 
Color.colorNames["oldlace"] = "rgb(253,245,230)"; 
Color.colorNames["olive"] = "rgb(128,128,0)"; 
Color.colorNames["olivedrab"] = "rgb(107,142,35)"; 
Color.colorNames["orange"] = "rgb(255,165,0)"; 
Color.colorNames["orangered"] = "rgb(255,69,0)"; 
Color.colorNames["orchid"] = "rgb(218,112,214)"; 
Color.colorNames["palegoldenrod"] = "rgb(238,232,170)"; 
Color.colorNames["palegreen"] = "rgb(152,251,152)"; 
Color.colorNames["paleturquoise"] = "rgb(175,238,238)"; 
Color.colorNames["palevioletred"] = "rgb(216,112,147)"; 
Color.colorNames["papayawhip"] = "rgb(255,239,213)"; 
Color.colorNames["peachpuff"] = "rgb(255,218,185)"; 
Color.colorNames["peru"] = "rgb(205,133,63)"; 
Color.colorNames["pink"] = "rgb(255,192,203)"; 
Color.colorNames["plum"] = "rgb(221,160,221)"; 
Color.colorNames["powderblue"] = "rgb(176,224,230)"; 
Color.colorNames["purple"] = "rgb(128,0,128)"; 
Color.colorNames["red"] = "rgb(255,0,0)"; 
Color.colorNames["rosybrown"] = "rgb(188,143,143)"; 
Color.colorNames["royalblue"] = "rgb(65,105,225)"; 
Color.colorNames["saddlebrown"] = "rgb(139,69,19)"; 
Color.colorNames["salmon"] = "rgb(250,128,114)"; 
Color.colorNames["sandybrown"] = "rgb(244,164,96)"; 
Color.colorNames["seagreen"] = "rgb(46,139,87)"; 
Color.colorNames["seashell"] = "rgb(255,245,238)"; 
Color.colorNames["sienna"] = "rgb(160,82,45)"; 
Color.colorNames["silver"] = "rgb(192,192,192)"; 
Color.colorNames["skyblue"] = "rgb(135,206,235)"; 
Color.colorNames["slateblue"] = "rgb(106,90,205)"; 
Color.colorNames["slategray"] = "rgb(112,128,144)"; 
Color.colorNames["snow"] = "rgb(255,250,250)"; 
Color.colorNames["springgreen"] = "rgb(0,255,127)"; 
Color.colorNames["steelblue"] = "rgb(70,130,180)"; 
Color.colorNames["tan"] = "rgb(210,180,140)"; 
Color.colorNames["teal"] = "rgb(0,128,128)"; 
Color.colorNames["thistle"] = "rgb(216,191,216)"; 
Color.colorNames["tomato"] = "rgb(255,99,71)"; 
Color.colorNames["turquoise"] = "rgb(64,224,208)"; 
Color.colorNames["violet"] = "rgb(238,130,238)"; 
Color.colorNames["wheat"] = "rgb(245,222,179)"; 
Color.colorNames["white"] = "rgb(255,255,255)"; 
Color.colorNames["whitesmoke"] = "rgb(245,245,245)";
Color.colorNames["yellow"] = "rgb(255,255,0)"; 
Color.colorNames["yellowgreen"] = "rgb(154,205,50)";

Color.specialNames = new Array();
Color.specialNames["transparent"] = "rgb(0,0,0)";

//TODO: handle this...  Comment this line out
//and browse some sites that have "transparent"
//set as a color...
