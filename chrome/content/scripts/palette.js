/**
 * Palette class. Maintains a colecction of swatches,
 * and provides options for operating on those swatches.
 */

function Palette(){
    this.swatches = new Array();
    this.selectedSwatches = new Array();

    /**
     * Return the set of selecte swatches
     */
    this.getSelectedSwatches = function(){
        return this.selectedSwatches;
    }
    
    this.selectAllSwatches = function(){
        Array.forEach(this.swatches, function(swatch) {
            swatch.select();
        });
    }
    
    /**
     * Make no swatches selected
     */
    this.deselectAllSwatches = function(){
        Array.forEach(this.swatches, function(swatch) {
            swatch.deselect();
        });
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
        Array.forEach(swatchArray, function(swatch) {
            swatch.select();
        });
    }
    
    /**
     * Remove a set of swatches from the selection
     */
    this.deselectSwatches = function(swatchArray){
        Array.forEach(swatchArray, function(swatch) {
            swatch.deselect();
        });
    }
    
    /**
     * Update this palette with a swatch's state
     */
    this.updateSelection = function(swatch){
        if (swatch.isSelected()){
            if(!this.selectedSwatches.contains(swatch)){
                this.selectedSwatches.push(swatch);
            }
        }
        else{
            this.selectedSwatches.remove(swatch);
        }
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
}

