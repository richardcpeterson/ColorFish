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
    
    Array.prototype.contains = function(item){
        var found = false;
        var i = 0;
        while (!found && i < this.length){
            found = (this[i] == item);
            i++;
        }
        return found;
    }
}