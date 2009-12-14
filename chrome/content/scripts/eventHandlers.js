/**
 * Adds an event handler to an element with the
 * given id.
 *
 * Params:
 * element     The DOM id of the target element,
 *             or the element itself
 * eventName   A string representing the event to
 *             handle, such as "click"
 * handler     A function to handle the event.
 */
function addHandlerToElement(element, eventName, handler) {
    if (typeof element == "string")
        element = document.getElementById(element);
    element.setAttribute("on"+eventName,handler.name + "(event);");
}

/**
 * Removes an event handler from an element with the
 * given id.
 *
 * Params:
 * element     The DOM id of the target element,
 *             or the element itself
 * eventName   A string representing the event to
 *             no longer handle, such as "click"
 */
function removeHandlerFromElement(element, eventName) {
    if (typeof element == "string")
        element = document.getElementById(element);
    element.setAttribute("on"+eventName,"");
}

/**
 * Load the page from the address bar if the event
 * is the enter key
 **/
function loadPageOnEnterKey(e) {
    if (!e){
        e = window.event;
    }
    if(e.keyCode == 13) {
        Browser.load_from_address_bar();
    }
}

function updateSwatchWithExplicitValue(e) {
    if (!e){
        e = window.event;
    }
    
    var swatchElement = e.target.parentNode;
    var swatch = swatchElement.relatedObjects.swatch;
    var textbox = swatchElement.relatedObjects.inputTextbox;
    var colorString = textbox.value;
    
    //Try to get a color from the given string
    if(!Color.isParsableString(colorString)){
        textbox.addClass("invalid");
        return false;
    }
    
    var newColor;
    try{
        newColor = Color.from_css(colorString);
    }
    catch(e){
        alert(e);
        return false;
    }

    //Actually update the real Swatches and page with
    //the new color
    swatch.setColor(newColor, Color.getFormat(colorString));
    swatchElement.updateControl();
    return true;
};

/**
 * Undo the most recent action on a particular swatch.
 * Assumes the element generating the event is a child
 * of the main swatch UI container element.
 */
function undoSwatch(e) {
    if (!e){
        e = window.event;
    }
    var swatchElement = e.target.parentNode;
    var swatch = swatchElement.relatedObjects.swatch;
    swatch.undo();
    swatchElement.updateControl();
    swatchElement.updateInputField();
    return true;
}
 
 /**
  * Redo the most recently undone action on a particular
  * swatch. Assumes that the element generating the event
  * is a child of the main swatch UI container for the
  * desired swatch
  */
 function redoSwatch(e) {
     if (!e){
         e = window.event;
     }
     var swatchElement = e.target.parentNode;
     var swatch = swatchElement.relatedObjects.swatch;
     swatch.redo();
     swatchElement.updateControl();
	 swatchElement.updateInputField();
     return true;
 }