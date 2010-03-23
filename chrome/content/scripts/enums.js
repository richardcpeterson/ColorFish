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

Enums.ColorFormats = {
    unknown : 0,
    rgb : 1,
    longHex : 2,
    shortHex : 3,
    colorName : 4,
    specialString : 5
}

/**
 * These two values are used as the first argument to the
 * CSApplication.chooseLocalFile() method.
 */
Enums.FilePicker = {
    Open: Components.interfaces.nsIFilePicker.modeOpen,
    Save: Components.interfaces.nsIFilePicker.modeSave
};
