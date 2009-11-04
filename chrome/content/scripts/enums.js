/**
 * Emulate enum
 */
function Enums(){
    alert("Please stop instantiating Enums");
    throw "No sense instantiating this";
}

/**
 * Define color property types. These are the kinds
 * of color properties that can exist in the DOM and
 * in a CSS document.
 */
Enums.ColorPropertyTypes = {
    color : 1,
    backgroundColor : 2,
    borderTopColor :3,
    borderRightColor :4,
    borderBottomColor : 5,
    borderLeftColor : 6
}