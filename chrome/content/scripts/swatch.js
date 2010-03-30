/**
 * Swatch class.  A reference to a color and all CSS color properties
 * associated with that color.
 *
 * The 'color' parameter is a Color object, as are similar variables
 * in the class below: e.g. liveEditColor, newColor, so on.
 */

function Swatch(color, colorFormat, palette){
    /*************************************************
     * Public Members
     ************************************************/
    //Currently set color
    this.color = color;

    //Color used during live editing, before the color
    //has been set and added to the swatch history
    this.liveEditColor = color.clone();

    //Use colorFormat if given, or default value
    this.format =
        (colorFormat?
         colorFormat:
         Enums.ColorFormats.longHex);

    //Save an association to the parent palette
    this.palette = palette;


    /**
     * Sets the color of the current swatch, setting
     * an undo-able Swatch state.
     * Both parameters are optional. If newColor
     * is given, it will update all properties for
     * that color. If colorFormat is given, it will
     * use the new color format. If neither
     * parameter is given, the current values in
     * the swatch will be used, and a new Swatch
     * state will be created from these values.
     */
    this.setColor = function(newColor, colorFormat) {
        //Push the old state onto the undo stack
        undoList.push(new Array(this.color, this.format) );

        //Clear the redo list - this wasn't an undone
        //command
        redoList = new Array();

        if (typeof newColor == "string")
            newColor = Color.from_css(newColor);

        //Update properties and color format if needed
        if (newColor){
            updateProperties(newColor);
            thisSwatch.color = newColor;
        }
        if (colorFormat){
            this.format = colorFormat;
        }

        notifySwatchSetColorObservers();
        notifyHistoryObservers();
    }

    this.isSelected = function(){
        return selected;
    }

    /**
     * Select this swatch
     */
    this.select = function(){
        if(!selected){
            selected = true;
            notifySelectionObservers();
        }
    }

    /**
     * Deselect this swatch
     */
    this.deselect = function(){
        if(selected){
            selected = false;
            notifySelectionObservers();
        }
    }

    this.reverseSelection = function(){
        selected = !selected;
        notifySelectionObservers();
    }

    /**
     * Set the transient color used to display this swatch
     * during live editing. This does not set any history
     * state.
     */
    this.setLiveEditColor = function(newColor){
        if (typeof newColor == "string")
            newColor = Color.from_css(newColor);
        this.liveEditColor = newColor;
        updateProperties(newColor);
        notifyLiveColorObservers();
    }

    /**
     * Undo the most recent setColor action that hasn't
     * already been undone. That is, go one step back in
     * the swatch's history
     */
    this.undo = function() {
        if (undoList.top()) {
            //Save the current state in the redo stack
            redoList.push(new Array(this.color, this.format));
            updateProperties(undoList.top()[0]);

            this.color = undoList.top()[0];
            this.format = undoList.top()[1];

            undoList.pop();
            notifyHistoryObservers();
        }
    };

    /**
     * Redo the most recently undone setColor action.
     * That is, go forward one step in the history.
     */
    this.redo = function() {
        if (redoList.top()) {
            //Save the current state in the undo stack
            undoList.push(new Array(this.color, this.format));
            updateProperties(redoList.top()[0]);

            this.color = redoList.top()[0];
            this.format = redoList.top()[1];

            redoList.pop();
            notifyHistoryObservers();
        }
    };

    /**
     * Lets us know if this swatch has any undo states.
     */
    this.canUndo = function(){
       return (undoList.length > 0);
    }

    /**
     * Lets us know if this swatch has any redo states
     */
    this.canRedo = function(){
        return (redoList.length > 0);
    }

    /**
     * Add a ColorProperty object to this swatch.
     */
    this.addProperty = function(newProperty){
        properties.push(newProperty);
    }

    /**
     * Return number of properties associated with this swatch.
     */
    this.count = function(){
        return properties.length;
    }

    /**
     * Add an observer that will be notified when this
     * swatch's color is SET - IE a history state is
     * changed.
     *
     * In order to be notified, the observer must have the
     * updateSwatchHistory(Swatch)
     * method, where "Swatch" will be a reference to this
     * swatch.
     */
    this.addHistoryObserver = function (observer) {
        historyObservers.push(observer);
    }

    /**
     * Add an observer that will be notified when this
     * swatch's color is set.
     *
     * In order to be notified, the observer must have the
     * updateSwatchSetColor(Swatch)
     * method, where "Swatch" will be a reference to this
     * swatch.
     */
    this.addSetColorObserver = function (observer) {
        setColorObservers.push(observer);
    }

    /**
     * Add an observer that will be notified when this
     * swatch's live color is changed. This occurs during
     * live editing, when a history state is not set.
     *
     * In order to be notified, the observer must have the
     * updateLiveColor(Swatch)
     * method, where "Swatch" will be a reference to this
     * swatch.
     */
    this.addLiveColorObserver = function (observer) {
        liveColorObservers.push(observer);
    }

    /**
     * Add an observer that will be notified when this
     * swatch's selection state is changed.
     *
     * In order to be notified, the observer must have the
     * updateSelection(Swatch)
     * method, where "Swatch" will be a reference to this
     * swatch.
     */
    this.addSelectionObserver = function (observer) {
        selectionObservers.push(observer);
    }

    this.removeHistoryObserver = function(observer){
        historyObservers.remove(observer);
    }

    this.removeSetColorObserver = function(observer){
        setColorObservers.remove(observer);
    }

    this.removeLiveColorObserver = function(observer){
        liveColorObservers.remove(observer);
    }

    this.removeSelectionObserver = function(observer){
        selectionObservers.remove(observer);
    }

    this.getProperties = function () {
        return properties;
    };

    /************************************************
     * Private members
     ***********************************************/
    //Save a reference to this Swatch, as "this" will
    //not necessarily refer to this swatch within
    //the non-member "private" functions below
    var thisSwatch = this;

    var undoList = new Array();
    var redoList = new Array();

    // The color properties associated with this swatch, stored as an
    // array of ColorProperty objects.
    var properties = new Array();

    //Lists of objects that observe this swatch's state
    var historyObservers = new Array();
    var liveColorObservers = new Array();
    var setColorObservers = new Array();
    var selectionObservers = new Array();

    var selected = false;

    /**
     * Update all color properties in this swatch to reflect
     * the value passed in color. This does not create
     * a new Swatch state to modify the undo stack.
     * color may be a valid CSS color string or a
     * Color object.
     */
    function updateProperties(color){
        if (typeof color == "string")
            color = Color.from_css(color);
        for(var i = 0; i < properties.length; i++) {
            properties[i].setColor(color);

            // Once we have changed a property we want to flag the
            // sheet from which it comes, that way we can let the user
            // know he has unsaved changes before doing something that
            // will destroy that stylesheet object.
            properties[i].style
                .parentRule
                .parentStyleSheet
                .colorFishSheet
                .hasUnsavedChanges = true;
        }
    }

    /**
     * Notify all registered observers that the color
     * has changed in the history.
     */
    function notifyHistoryObservers(){
        for(var i = 0; i < historyObservers.length; i++){
            historyObservers[i].updateSwatchHistory(thisSwatch);
        }
    }

    /**
     * Notify all registered observers that a new Color has
     * been set.
     */
    function notifySwatchSetColorObservers(){
        for(var i = 0; i < setColorObservers.length; i++){
            setColorObservers[i].updateSwatchSetColor(thisSwatch);
        }
    }

    /**
     * Notify all registered observers that the live editing
     * color has changed
     */
    function notifyLiveColorObservers(){
        for(var i = 0; i < liveColorObservers.length; i++){
            liveColorObservers[i].updateLiveColor(thisSwatch);
        }
    }

    /**
     * Notify all registered observers that this swatch's
     * selection state has changed
     */
    function notifySelectionObservers(){
        for(var i = 0; i < selectionObservers.length; i++){
            selectionObservers[i].updateSelection(thisSwatch);
        }
    }
}

/***
 * Takes two numbers.  The return value is:
 *
 *   1  if  x > y
 *  -1  if  x < y
 *   0  if  x = y
 *
 * This makes it more convenient to write functions below for
 * comparing hue and lightness.
 */
Swatch.compareNumbers = function(x, y) {
    return (
        (x > y) ? 1 : (x < y) ? -1 : 0
    );
}


/**
 * Compare the hue of one swatch to another.
 * if hue(s1)>hue(s2), returns positive.
 * if hue(s1)<hue(s2), returns negative.
 * if hue(s1)==hue(s2), returns 0
 */
Swatch.compareHue = function(s1, s2) {
    return Swatch.compareNumbers(
        s1.color.getHue(),
        s2.color.getHue()
    );
}

/**
 * Compare the hue of one swatch to another.
 * if hue(s1)>hue(s2), returns positive.
 * if hue(s1)<hue(s2), returns negative.
 * if hue(s1)==hue(s2), returns the comparison of
 *    lightness by the same rules.
 * if hue and lightness are equal, than returns 0.
 */
Swatch.compareHueAndLightness = function(s1, s2) {
    return Swatch.compareHue(s1, s2) || Swatch.compareNumbers(
        s1.color.getLightness(),
        s2.color.getLightness()
    );
}

/**
 * Puts the hex code for the color of this swatch on the clipboard.
 */
Swatch.prototype.copyColorToClipboard = function () {
    Components.classes["@mozilla.org/widget/clipboardhelper;1"]
        .getService( Components.interfaces.nsIClipboardHelper )
        .copyString( this.color.getCSSHex() );
};

/**
 * Pastes the current color from the clipboard and sets it as the
 * color for this swatch.
 */
Swatch.prototype.pasteColorFromClipboard = function () {
    var clipboard = Components.classes["@mozilla.org/widget/clipboard;1"]
        .getService( Components.interfaces.nsIClipboard );

    var transfer = Components.classes["@mozilla.org/widget/transferable;1"]
        .createInstance( Components.interfaces.nsITransferable );
    transfer.addDataFlavor("text/unicode");

    // We are expecting to get a string from the clipboard.  But we
    // have no way of knowing if that will be the case.  This is why
    // our colorString is a generic Object instead of a String---it
    // could end up being anything.

    var colorString = {};
    var colorStringLength = {};

    try {
        clipboard.getData(transfer, clipboard.kGlobalClipboard);
        transfer.getTransferData("text/unicode", colorString, colorStringLength);

        if (colorString) {
            colorString = colorString.value.QueryInterface(Components.interfaces.nsISupportsString);
            colorString = colorString.data.substring(0, colorStringLength.value / 2);
        }
    }
    // It's possible for the code above to throw an exception if the
    // user does not have anything on the clipboard.  In that case, we
    // silently return without changing the swatch color.
    catch (exception) {
        return;
    }

    this.setColor(colorString);
};