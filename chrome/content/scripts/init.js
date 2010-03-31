/***
 * Initializes the application
 */
function initApp(){

    /**
     * Teach all objects to recursively dump
     * their properties to the terminal. Use this
     * like
     *    myObj.dumpProps()
     * or set a max depth, like
     *    myObj.dumpProps(2)
     * Be careful with how deep you set that, and
     * beware of infinite reference loops...
     *
     * Do not pass this function a second argument.
     */
    Object.prototype.dumpProps = function(maxDepth, currentDepth) {
        //Default max depth
        if(!maxDepth){
            maxDepth = 0;
        }

        //Initial output heading
        if(!currentDepth){
            currentDepth = 0;
            dump("\n===Dumping Object===\n");
            dump(this + "\n");
        }

        //Set the current indentation level
        var indent = "   ";
        indent = indent.repeat(currentDepth);

        //Current output text
        var text = "";
        //Type of current property
        var type = null;

        /**
         * Output all the properties of this object,
         * and recurse where the property is an
         * object
         */
        for (var prop in this) {
            //We _could_ decide not to show dumpProps
            //among the fields, and this code would
            //do that. But that would be lying.
            //if (prop == "dumpProps"){
            //    continue;
            //}

            //Text always starts with an indent
            text = indent;

            //Try to figure out the type of the current
            //property. Sometimes this doesn't work,
            //and we just leave it at that.
            type = null;
            try{
                type = typeof this[prop];
            }
            catch(error){
                text += prop + ": This member does not support 'typeof'\n";
            }

            //Don't print the body of functions
            if (type == "function"){
                text +=  "function " + prop + " {...}\n";
            }
            //Print out all other members
            else if (type != null){
                text += prop + " = " + this[prop] + "\n";
            }
            dump(text);

            //Recursively dump child objects
            if (type == "object"
                && this[prop] != null
                && currentDepth < maxDepth) {
                this[prop].dumpProps(maxDepth, currentDepth + 1);
            }
        }
        //Final newlines
        if (currentDepth == 0){
            dump("\n\n");
        }
    }

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
     * Teach arrays to remove individual items.
     *
     * If the item is not in the array, nothing
     * will happen.
     */
    Array.prototype.remove = function(item){
        var index = this.indexOf(item);
        if (index >= 0){
            this.splice(this.indexOf(item), 1);
        }
    }

    /**
     * Returns the last item of an array---the top when we treat it as
     * a stack.  This is essentially the equivalent of pop() except it
     * doesn't remove the item.
     */
    Array.prototype.top = function () {
        return this[ this.length - 1 ];
    };

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
        if (!this.hasClass(classString)){
            this.className += " "+classString;
            this.className = this.className.replace(/\s+/g," ");
        }
    }

    /**
     * Remove a class from an element, if it exists
     * in the element's class string
     */
    Element.prototype.removeClass = function(classString) {
        if (this.hasClass(classString)) {
            var reg = new RegExp("\\b" + classString + "\\b");
            this.className = this.className.replace(reg, " ");
            this.className = this.className.replace(/\s+/g," ");
        }
    }

    /**
     * Add a "relatedObjects" object / array to
     * all Elements. This array can hold
     * references to other UI elements, so we
     * don't have to traverse the DOM looking for
     * siblings, etc.
     */
    Element.prototype.addRelatedObject = function(name, object){
        if (!this.relatedObjects){
            this.relatedObjects = new Array();
        }
        this.relatedObjects[name] = object;
    }

    /***
     * Removes all children nodes from an element.
     */
    Element.prototype.removeAllChildren = function() {
        var nodeCount = this.childNodes.length;

        while (nodeCount--) {
            this.removeChild( this.firstChild );
        }
    };

    /***
     * If a string is intended to contain a stylesheet then it is
     * useful to have a way of validating those contents.  See the
     * comments within csStylesheet.getOriginalText() for a situation
     * where we need to know this (when we get a status code 200).
     *
     * To check for validity we use a simple heuristic: if the
     * character '<' appears outside of comments or the token '<!--'
     * then the string is not a valid stylesheet.  The grammar for CSS
     * does not permit that character to appear anywhere else.  So our
     * test is to look for it, and if we find it then we scan ahead to
     * see if we are in a comment or not.  If not, the string is not
     * valid CSS and we return a boolean indicating that.
     */
    String.prototype.isValidStylesheet = function () {
        var clean_sheet   = this.removeComments();
        var bracket_index = clean_sheet.indexOf("<");

        while (bracket_index !== -1) {

            if (clean_sheet.charAt(bracket_index + 1) !== "!" ||
                clean_sheet.charAt(bracket_index + 2) !== "-" ||
                clean_sheet.charAt(bracket_index + 3) !== "-" ) {
                return false;
            }

            bracket_index = clean_sheet.indexOf("<", bracket_index + 1);
        }

        return true;
    };

    /***
     * This function takes the given string and removes all CSS
     * comment blocks from it.  It returns a new string, and does not
     * modify the original.
     */
    String.prototype.removeComments = function () {
        return this.replace(/\/\*[\s\S]*?\*\//g, "");
    };

    //Our global browser instance.
    window.Browser = new Browser();
    window.csApp = new CSApplication();

    /**
     * To catch all of the ways the application may shut down, we need
     * to create and register an observer that will listen for
     * 'quit-application-requested' notifications.
     */
    let quitObserver = {
        observer: function (subject, topic, data) {
        },
        register: function () {
            Components.classes["@mozilla.org/observer-service;1"]
                .getServer( Components.interfaces.nsIObserverService )
                .addObserver(this, "quit-application-requested", false);
        },
        unregister: function () {
            Components.classes["@mozilla.org/observer-service;1"]
                .getServer( Components.interfaces.nsIObserverService )
                .removeObserver(this, "quit-application-requested");
        }
    };

    addHandlerToElement("uri-input", "keypress", loadPageOnEnterKey);
    document.getElementById("uri-input").focus();

    window.Browser.load_page("chrome://csschemer/content/help/index.html");
}