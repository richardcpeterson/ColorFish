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
    this.originalFormat = Color.getFormat(this.getColorString());
}

ColorProperty.prototype.setColor = function (colorString) {
    this.style.update(this.propertyType, colorString);
};

ColorProperty.prototype.getColorString = function () {
    return this.style.property(this.propertyType);
};

ColorProperty.prototype.undoColor = function (colorString) {
    return this.style.undo();
};

/**
 * Return a new Color object representing this property's color.
 */
ColorProperty.prototype.getColor = function () {
    return Color.from_css(this.getColorString());
}

