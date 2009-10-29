/***
 * Initializes the application
 */
function initApp(){
    //Our global browser instance.
    window.Browser = new Browser();
  
    addHandlerToElement("uri-input", "keypress", loadPageOnEnterKey);
    document.getElementById("uri-input").focus();
}