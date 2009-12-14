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

function updateSwatch(target, color) {

    var textbox = target;
    if(!Color.isParsableString(color)){
        textbox.addClass("invalid");
        return false;
    }
    var newColor;
    try{
        newColor = Color.from_css(color);
    }
    catch(e){
        alert(e);
        return false;
    }

    /**
     * Show and hide the modified swatch. Show the swatch
     * when it is different from the original swatch.
     * Hide it when it is the same as the original swatch.
     */
    var swatch1 = target.parentNode.getElementsByTagName("box")[0];
    var swatch2 = target.parentNode.getElementsByTagName("box")[1];
    //If the new color is the same as the original color
    if (Color.from_css(swatch1.style.backgroundColor).equals(newColor)){
        swatch2.addClass("hidden");
    }
    //The new color is different from the original color
    else {
        //Make the swatch the new background color
        swatch2.setAttribute(
            "style",
            "background-color: " + newColor.getCSSHex());
        swatch2.removeClass("hidden");
    }

    //Valid color
    textbox.removeClass("invalid");

    // Update textbox
    //target.parentNode.relatedObjects.get(textbox).value = newColor;
    return true;
}

function updateSwatchWithExplicitValue(e) {
    if (!e){
        e = window.event;
    }

    //Actually update the real Swatches and page with
    //the new color
    //     e.target.parentNode.swatch.updateProperties(e.target.value);

    if (updateSwatch(e.target, e.target.value)) {
        return e.target.parentNode.swatch.updateProperties(e.target.value)
    }
};

function undoSwatch(e) {
    if (!e){
        e = window.event;
    }

    return updateSwatch(e.target, e.target.parentNode.swatch.undoProperties());
}