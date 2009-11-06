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
    
    /**
     * Allow arrays to tell us if they contain
     * a particular element as a value
     */
    Array.prototype.contains = function(item){
        var found = false;
        var i = 0;
        while (!found && i < this.length){
            found = (this[i] == item);
            i++;
        }
        return found;
    }
    
    /**
     * Check if the element has a particular class
     * assigned to it in its class string
     */
    Element.prototype.hasClass = function(classString){
        return this.className.match(new RegExp("\\b" + classString + "\\b"));
    }
    
    /**
     * Add a class to an element's class string
     * (if it isn't already in the string)
     */
    Element.prototype.addClass = function(classString) {
        if (!this.hasClass(classString))
            this.className += " "+classString;
    }
    
    /**
     * Remove a class from an element, if it exists
     * in the element's class string
     */
    Element.prototype.removeClass = function(classString) {
        if (this.hasClass(classString)) {
            var reg = new RegExp("\\b" + classString + "\\b");
            this.className = this.className.replace(reg,' ');
        }
    }
}