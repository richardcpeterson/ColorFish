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
 *     A string naming the property being represented by this
 *     object, e.g. 'backgroundColor' or 'borderBottomColor'.
 *
 */
function ColorProperty(style, propertyType) {
    this.style = style;
    this.propertyType = propertyType;
    this.originalFormat = 0;

    //Functions to be defined based on propertyType
    this.setColor = null;
    this.getColor = null;

    // Define these functions depending on which propertyType this
    // ColorProperty is supposed to access.
    this.setColor = function(colorString) {
        this.style.update(propertyType, colorString);
    };

    this.undoColor = function(colorString) {
        return this.style.undo();
    };

    this.getColorString = function() {
        return this.style.property(propertyType);
    };

    /**
     * Return a new Color object representing this
     * property's color
     */
    this.getColor = function(){
        return Color.from_css(this.getColorString());
    }

    this.originalFormat = Color.getFormat(this.getColorString());
}