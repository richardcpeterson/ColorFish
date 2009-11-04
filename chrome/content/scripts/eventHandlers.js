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
  var textbox = e.target.parentNode.getElementsByTagName("textbox")[0];
  if(!Color.isParsableString(textbox.value)){
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
  
  e.target.parentNode.swatch.color = newColor;
  e.target.parentNode.swatch.updateProperties();
}