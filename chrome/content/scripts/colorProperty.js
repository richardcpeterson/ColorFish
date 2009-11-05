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
    this.originalFormat = 0;
    
    //Functions to be defined based on propertyType
    this.setColor = null;
    this.getColor = null;
    
    //Define these functions depending on which
    //propertyType this ColorProperty is supposed
    //to access.
    switch(propertyType){
        case Enums.ColorPropertyTypes.color :
            this.setColor = function(colorString){
                this.style.color = colorString;
            };
            this.getColorString = function(){
                return this.style.color;
            };
            break;
        case Enums.ColorPropertyTypes.backgroundColor :
            this.setColor = function(colorString){
                this.style.backgroundColor = colorString;
            };
            this.getColorString = function(){
                return this.style.backgroundColor;
            };
            break;
        case Enums.ColorPropertyTypes.borderTopColor :
            this.setColor = function(colorString){
                this.style.borderTopColor = colorString;
            };
            this.getColorString = function(){
                return this.style.borderTopColor;
            };
            break;
        case Enums.ColorPropertyTypes.borderRightColor :
            this.setColor = function(colorString){
                this.style.borderRightColor = colorString;
            };
            this.getColorString = function(){
                return this.style.borderRightColor;
            };
            break;
        case Enums.ColorPropertyTypes.borderBottomColor :
            this.setColor = function(colorString){
                this.style.borderBottomColor = colorString;
            };
            this.getColorString = function(){
                return this.style.borderBottomColor;
            };
            break;
        case Enums.ColorPropertyTypes.borderLeftColor :
            this.setColor = function(colorString){
                this.style.borderLeftColor = colorString;
            };
            this.getColorString = function(){
                return this.style.borderLeftColor;
            };
            break;
        default :
            this.setColor = function(){
                alert("ColorProperties.setColor() default case");
            }
            this.getColorString = function(){
                alert("ColorProperties.getColorString() default case");
            }
            break;
    }
    
    /**
     * Return a new Color object representing this
     * property's color
     */
    this.getColor = function(){
        return Color.from_css(this.getColorString());
    }
    
    this.originalFormat = Color.getFormat(this.getColorString());
}