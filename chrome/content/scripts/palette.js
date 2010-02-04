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
    
    /**
     * Undo the most recently done action on this palette that
     * hasn't already been undone.*/
    this.undo = function(){
        if (this.canUndo()){
            undoList.top().undo();
            redoList.push(undoList.pop());
        }
    }
    
    /**
     * Redo the most recently undone action
     **/
    this.redo = function(){
        if (this.canRedo()){
            redoList.top().redo();
            undoList.push(redoList.pop());
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
     * Insert all applicable properties from a style into the palette,
     * using existing swatches where the swatch matches the color of
     * the color property from the style being inserted. That is, the
     * properties from the given style will be consolidated into this
     * palette.
     */
    this.insertStyle = function(style) {
        var palette    = this;
        var properties = [
            'color',
            'backgroundColor',
            'borderTopColor',
            'borderBottomColor',
            'borderRightColor',
            'borderLeftColor'
        ];

        properties.forEach( function(property) {
            if (style && style.property(property)) {
                palette.insertProperty(
                    new ColorProperty(style, property)
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
    
    var thisPalette = this;
    
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

