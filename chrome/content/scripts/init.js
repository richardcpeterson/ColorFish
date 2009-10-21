/***
 * Initializes the application
 */

function initApp(){
  /***
   * Our global browser instance.
   */
  window.Browser = new Browser();
  
  addHandlerToElement("uri-input", "keypress", loadPageOnEnterKey);
}

function dumpProps(obj, parent) {
   // Go through all the properties of the passed-in object
   for (var i in obj) {
      // if a parent (2nd parameter) was passed in, then use that to
      // build the message. Message includes i (the object's property name)
      // then the object's property value on a new line
      if (parent) { var msg = parent + "." + i + "\n" + obj[i]; } else { var msg = i + "\n" + obj[i]; }
      // Display the message. If the user clicks "OK", then continue. If they
      // click "CANCEL" then quit this level of recursion
      if (!confirm(msg)) { return; }
      // If this property (i) is an object, then recursively process the object
      if (typeof obj[i] == "object") {
         if (parent) { dumpProps(obj[i], parent + "." + i); } else { dumpProps(obj[i], i); }
      }
   }
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