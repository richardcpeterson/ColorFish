/**
 * Holds a reference to a color property in a CSS
 * rule set.
 */

/**
 * Instantiate a colorProperty.
 * Params:
 * style    a CSSStyleDeclaration object
 *          https://developer.mozilla.org/en/DOM/cssRule.style
 *
 * propertyType
 *          A value from Enums.ColorPropertyTypes
 *          that represents which property of the given
 *          style is being referenced by this
 *          colorProperty object.
 */
function ColorProperty(style, propertyType) {
    this.style = style;
    this.propertyType = propertyType;
    
    /**
     * Set the color property using a string
     * representation of a color (ie #FFFFFF)
     */
    this.setColor = function(colorString){
        
        //Depending on which property this references,
        //set that property
        switch(this.propertyType){
            case Enums.ColorPropertyTypes.color :
                this.style.color = colorString;
                break;
            case Enums.ColorPropertyTypes.backgroundColor :
                this.style.backgroundColor = colorString;
                break;
            case Enums.ColorPropertyTypes.borderTopColor :
                this.style.borderTopColor = colorString;
                break;
            case Enums.ColorPropertyTypes.borderRightColor :
                this.style.borderRightColor = colorString;
                break;
            case Enums.ColorPropertyTypes.borderBottomColor :
                this.style.borderBottomColor = colorString;
                break;
            case Enums.ColorPropertyTypes.borderLeftColor :
                this.style.borderLeftColor = colorString;
                break;
            default :
                break;
        }
    }
    
    /**
     * Get the color represented by this property
     */
    this.getColorString = function(){
        switch(this.propertyType){
            case Enums.ColorPropertyTypes.color :
                return this.style.color;
                break;
            case Enums.ColorPropertyTypes.backgroundColor :
                return this.style.backgroundColor;
                break;
            case Enums.ColorPropertyTypes.borderTopColor :
                return this.style.borderTopColor;
                break;
            case Enums.ColorPropertyTypes.borderRightColor :
                return this.style.borderRightColor;
                break;
            case Enums.ColorPropertyTypes.borderBottomColor :
                return this.style.borderBottomColor;
                break;
            case Enums.ColorPropertyTypes.borderLeftColor :
                return this.style.borderLeftColor;
                break;
            default :
                break;
        }
        return null;
    }
    
    /**
     * Return a new Color object representing this
     * property's color
     */
    this.getColor = function(){
        return Color.from_css(this.getColorString());
    }
}