/**
 * Swatch class.  A reference to a color and all
 * CSS color properties associated with that color.
 */

function Swatch(){
    this.color = null;
    
    //An array of color properties
    this.properties = new Array();
    
    this.updateProperties = function(){
        var hexColor = color.getCSSHex();
        for(i in this.properties){
            this.properties[i] = hexColor;
        }
    }
}