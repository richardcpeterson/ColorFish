/**
 * Palette class. Maintains a colecction of swatches,
 * and provides options for operating on those swatches.
 */

function Palette(){
    this.swatches = new Array();
    this.selectedSwatches = new Array();
    this.mostRecentlySelectedSwatch = null;

    this.selectionObservers = [];

    /**
     * Returns the number of swatches in
     * this palette
     */
    this.size = function(){
        return this.swatches.length;
    }

    /**
     * Returns the number of selected swatches
     * in this palette
     */
    this.selectionSize = function(){
        return this.selectedSwatches.length;
    }

    /**
     * Return the set of selecte swatches
     */
    this.getSelectedSwatches = function(){
        return this.selectedSwatches;
    }

    this.selectAllSwatches = function(){
        startSelectionNotificationBuffer();
        Array.forEach(this.swatches, function(swatch) {
            swatch.select();
        });
        flushSelectionNotificationBuffer();
    }

    /**
     * Make no swatches selected
     */
    this.deselectAllSwatches = function(){
        startSelectionNotificationBuffer();
        this.swatches.forEach(function(swatch) {
            swatch.deselect();
        });
        flushSelectionNotificationBuffer();
    }

    /**
     * Add a swatch to the selection
     */
    this.selectSwatch = function(swatch){
        if (!this.selectedSwatches.contains(swatch)){
            swatch.select();
        }
    }

    /**
     * Remove a swatch from the selection
     */
    this.deselectSwatch = function(swatch){
        swatch.deselect();
    }

    /**
     * Add a set of swatches to the selection
     */
    this.selectSwatches = function(swatchArray){
        startSelectionNotificationBuffer();
        Array.forEach(swatchArray, function(swatch) {
            swatch.select();
        });
        flushSelectionNotificationBuffer();
    }

    /**
     * Remove a set of swatches from the selection
     */
    this.deselectSwatches = function(swatchArray){
        startSelectionNotificationBuffer();
        Array.forEach(swatchArray, function(swatch) {
            swatch.deselect();
        });
        flushSelectionNotificationBuffer();
    }

    /**
     * Select a range of swatches between swatchA and swatchB
     */
    this.selectSwatchRange = function(swatchA, swatchB){
        if(!this.swatches.contains(swatchA) || !this.swatches.contains(swatchB)){
            return;
        }
        //Find the start and end of the range
        var startIndex = Math.min(
                this.swatches.indexOf(swatchA),
                this.swatches.indexOf(swatchB));
        var endIndex = Math.max(
                this.swatches.indexOf(swatchA),
                this.swatches.indexOf(swatchB));

        startSelectionNotificationBuffer();
        //Select all swatches in the range
        for(var i = startIndex; i <= endIndex; i++){
            this.swatches[i].select();
        }
        flushSelectionNotificationBuffer();
    }
    
    this.selectSimilar = function(referenceSwatch){
        startSelectionNotificationBuffer();
        
        var distances = [];
        Array.forEach(this.swatches, function(swatch) {
            swatch.deselect();
            swatch.dumpProps();
            distances.push(
                [referenceSwatch.color.HCLDistanceFrom(swatch.color),
                swatch]
            );
        });
        
        //Sort by distances
        distances.sort(function(a, b){
            return (a[0] - b[0])
        });
        
        var count = this.swatches.length;
        
        var index = 0;
        while (index <= count && index < 5){
            distances[index][1].select();
            index++;
        }
        flushSelectionNotificationBuffer();
    }
    
    /**
     * Undo the most recently done action on this palette that
     * hasn't already been undone.*/
    this.undo = function(){
        if (this.canUndo()){
            undoList.top().undo();
            redoList.push(undoList.pop());
            notifyHistoryObservers();
        }
    }

    /**
     * Redo the most recently undone action
     **/
    this.redo = function(){
        if (this.canRedo()){
            redoList.top().redo();
            undoList.push(redoList.pop());
            notifyHistoryObservers();
        }
    }

    /**
     * Lets us know if this palette has any undo states.
     */
    this.canUndo = function(){
       return (undoList.length > 0);
    }

    /**
     * Lets us know if this palette has any redo states
     */
    this.canRedo = function(){
        return (redoList.length > 0);
    }

    /**
     * Update this palette with a swatch's state
     */
    this.updateSelection = function(swatch){
        if (swatch.isSelected()){
            if(!this.selectedSwatches.contains(swatch)){
                this.selectedSwatches.push(swatch);
                this.mostRecentlySelectedSwatch = swatch;
            }
        }
        else{
            this.selectedSwatches.remove(swatch);
        }
        this.notifySelectionObservers();
    }

    this.updateSwatchSetColor = function(swatch){
        undoList.push(swatch);

        //Clear the redo list - this wasn't an undone
        //command
        redoList = new Array();
        notifyHistoryObservers();
    }

    /**
     * Insert a color property into the pallete,
     * inserting into an existing swatch if one
     * exists with an equivalent color, or creating
     * a new swatch if no swatch with the equivalent
     * color exists in this palette.
     *
     * Params:
     * property   A colorProperty to be inserted
     */
    this.insertProperty = function(property) {
        var foundInPalette = false;
        var i = 0;
        var color = property.getColor();

        //Look for an existing swatch with the same color
        while(i < this.swatches.length && !foundInPalette){
            foundInPalette = color.equals(this.swatches[i].color);
            i++;
        }

        //Insert into existing swatch
        if (foundInPalette){
            this.swatches[i-1].addProperty(property);
        }

        //Create new swatch
        else {
            var newSwatch = new Swatch(color, null, this);
            newSwatch.addProperty(property);

            //We want to be notified of selection
            //changes to this swatch
            newSwatch.addSelectionObserver(this);

            newSwatch.addSetColorObserver(this);
            this.swatches.push(newSwatch);
        }
    }

    /**
     * Insert all applicable properties from a rule into the palette,
     * using existing swatches where the swatch matches the color of
     * the color property from the style being inserted. That is, the
     * properties from the given rule will be consolidated into this
     * palette.
     *
     * The argument to this function is a DOM cssRule.
     */
    this.insertRule = function(rule) {
        //Don't process a null rule
        if(!rule){
            return;
        }
        
        var palette    = this;
        var properties = [
            'color',
            'background-color',
            'border-top-color',
            'border-bottom-color',
            'border-right-color',
            'border-left-color'
        ];

        //A particular rule may have 0 to 6 color properties defined
        //in it (the properties listed above). We want to be able to
        //access each of these separately. Thus we create a new
        //"ColorProperty" object for each of the above properties that
        //is set in "rule". EG if this particular rule sets "color"
        //and "background-color", we want to insert a new ColorProperty
        //object for each of those.
        
        //Loop through, seeing if each property needs to be created
        properties.forEach( function(property) {
            //If the property is set
            if (rule.style.getPropertyValue(property)) {
                palette.insertProperty(
                    new ColorProperty(rule, property)
                );
            }
        });
    }

    /* Add an observer that will be notified when
     * the selection on this palette changes
     */
    this.addSelectionObserver = function(observer){
        this.selectionObservers.push(observer);
    }

    this.removeSelectionObserver = function(observer){
        this.selectionObservers.remove(observer);
    }


    /* Notify all selection observers of a change
     * to this palette's selection set
     */
    this.notifySelectionObservers = function(){
        if(!selectionNotificationsBuffered){
            for(var i = 0; i < this.selectionObservers.length; i++){
                this.selectionObservers[i].updatePaletteSelection(this);
            }
        }
    }

    /* Add an observer that will be notified when
     * the palette's history is modified
     */
    this.addHistoryObserver = function (observer) {
        historyObservers.push(observer);
    }

    this.removeHistoryObserver = function(observer){
        historyObservers.remove(observer);
    }


    /* Notify all selection observers of a change
     * to this palette's selection set
     */
    this.notifySelectionObservers = function(){
        if(!selectionNotificationsBuffered){
            for(var i = 0; i < this.selectionObservers.length; i++){
                this.selectionObservers[i].updatePaletteSelection(this);
            }
        }
    }


    var thisPalette = this;

    /**
     * Notify all registered observers that the palette's history
     * has changed.
     */
    function notifyHistoryObservers(){
        for(var i = 0; i < historyObservers.length; i++){
            historyObservers[i].updatePaletteHistory(thisPalette);
        }
    }

    var historyObservers = [];

    var undoList = [];
    var redoList = [];

    /**
     * When we change lots of swatch selections at once, we don't
     * want to issue notifications individually. Thus we only notify
     * at the end. We use this "buffering" to accomplish that.
     * No, it's not actually buffering. Come up with a better name,
     * why don't you.
     */
    var selectionNotificationsBuffered = false;
    function startSelectionNotificationBuffer(){
        selectionNotificationsBuffered = true;
    }
    function flushSelectionNotificationBuffer(){
        selectionNotificationsBuffered = false;
        thisPalette.notifySelectionObservers();
    }
}

