/**
 * Holds a reference to a color property in a CSS
 * rule set.
 */

/**
 * Instantiate a colorProperty.
 * Params:
 * rule     a cssRule object
 *          https://developer.mozilla.org/en/DOM/cssRule
 *
 * propertyType
 *     A string naming the property being represented by this
 *     object, e.g. 'background-color' or 'border-bottom-color'.
 *
 */
function ColorProperty(rule, propertyType) {
    //We only really need the CSSStyleDeclaration
    //(https://developer.mozilla.org/en/DOM/CSSStyleDeclaration)
    //for access to the properties.
    //rule.style is a CSSStyleDeclaration.
    this.style = rule.style;
    this.propertyType = propertyType;
}

ColorProperty.prototype.setColor = function (colorString) {
    this.style.setProperty(this.propertyType, colorString, "");
};

ColorProperty.prototype.getColorString = function () {
    return this.style.getPropertyValue(this.propertyType);
};

/**
 * Return a new Color object representing this property's color.
 */
ColorProperty.prototype.getColor = function () {
    return Color.from_css(this.getColorString());
}

