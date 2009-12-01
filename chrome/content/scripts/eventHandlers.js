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
function addHandlerToElement(element, eventName, handler){
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

function updateSwatchWithExplicitValue(e){
  if (!e){
    e = window.event;
  }
  
  var textbox = e.target;
  if(!Color.isParsableString(textbox.value)){
    textbox.addClass("invalid");
    return;
  }
  var newColor;
  try{
      newColor = Color.from_css(textbox.value);
  }
  catch(e){
      alert(e);
      return;
  }
  
  /**
   * Show and hide the modified swatch. Show the swatch
   * when it is different from the original swatch.
   * Hide it when it is the same as the original swatch.
   */
  var swatch1 = e.target.parentNode.getElementsByTagName("box")[0];
  var swatch2 = e.target.parentNode.getElementsByTagName("box")[1];
  //If the new color is the same as the original color
  if (Color.from_css(swatch1.style.backgroundColor).equals(newColor)){
      swatch2.addClass("hidden");
  }
  //The new color is different from the original color
  else{
      //Make the swatch the new background color
      swatch2.setAttribute(
            "style",
            "background-color: " + newColor.getCSSHex());
      swatch2.removeClass("hidden");
  }
  
  //Valid color
  textbox.removeClass("invalid");
  
  //Actually update the real Swatches and page with
  //the new color
  e.target.parentNode.swatch.color = newColor;
  e.target.parentNode.swatch.updateProperties();
}