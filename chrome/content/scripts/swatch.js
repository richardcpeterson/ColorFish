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
    
    
    this.compareHue = function(otherSwatch){
        return(
            (otherSwatch.color.getHue() > this.color.getHue())?
              -1
            : ((otherSwatch.color.getHue() < this.color.getHue())? 1
               :0)
        );
    }
}