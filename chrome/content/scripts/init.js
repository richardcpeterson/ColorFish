/***
 * Initializes the application
 */
function initApp(){
    //Our global browser instance.
    window.Browser = new Browser();
    window.csApp = new CSApplication();
  
    addHandlerToElement("uri-input", "keypress", loadPageOnEnterKey);
    document.getElementById("uri-input").focus();
    
    //Add repeat functionality to string
    String.prototype.repeat = function(count){
        return new Array(count + 1).join(this);
    }
}