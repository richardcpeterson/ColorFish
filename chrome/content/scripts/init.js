/***
 * Initializes the application
 */

function initApp(){
  addHandlerToElement("uri-input", "keypress", loadPageOnEnterKey);
}


/**
 * Load the page if the event is the enter key
 **/
function loadPageOnEnterKey(e) {
  if (!e){
    e = window.event;
  }
  if(e.keyCode == 13) {
    Browser.load_from_address_bar();
  }
}



/**
 * Adds an event handler to an element with the
 * given id.
 *
 * Params:
 * id          The DOM id of the target element
 * eventName   A string representing the event to
 *             handle, such as "click"
 * handler     A function to handle the event.
 */
function addHandlerToElement(id, eventName, handler){
  var obj = document.getElementById(id);
  obj.setAttribute("on"+eventName,handler.name + "(event);");
}

/**
 * Removes an event handler from an element with the
 * given id.
 *
 * Params:
 * id          The DOM id of the target element
 * eventName   A string representing the event to
 *             no longer handle, such as "click"
 */
function removeHandlerFromElement(id, eventName) {
  var obj = document.getElementById(id);
  obj.setAttribute("on"+eventName,"");
}