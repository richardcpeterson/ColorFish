/**
 * Palette class. Maintains a colecction of swatches,
 * and provides options for operating on those swatches.
 */

function Palette(sourceDocument){
    this.document = sourceDocument;
    this.swatches = new Array();
    
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
            var newSwatch = new Swatch(color);
            newSwatch.addProperty(property);
            this.swatches.push(newSwatch);
        }
    }
    
    /**
     * Insert all applicable properties from a 
     * style into the palette, using existing
     * swatches where the swatch matches the
     * color of the color property from the
     * style being inserted. That is, the
     * properties from the given style will be
     * consolidated into this palette.
     */
    this.insertStyle = function(style) {
        //If the rule has a color property,
        //insert it
        if (style.color){
            this.insertProperty(
                new ColorProperty(
                    style,
                    Enums.ColorPropertyTypes.color
                )
            );
        }
        
        //If the rule has a backgroundColor
        //property, insert it
        if (style.backgroundColor){
            this.insertProperty(
                new ColorProperty(
                    style,
                    Enums.ColorPropertyTypes.backgroundColor
                )
            );
        }
        
        //If the rule has a borderTopColor
        //property, insert it
        if (style.borderTopColor){
            this.insertProperty(
                new ColorProperty(
                    style,
                    Enums.ColorPropertyTypes.borderTopColor
                )
            );
        }
        
        //If the rule has a borderRightColor
        //property, insert it
        if (style.borderRightColor){
            this.insertProperty(
                new ColorProperty(
                    style,
                    Enums.ColorPropertyTypes.borderRightColor
                )
            );
        }
        
        //If the rule has a borderBottomColor
        //property, insert it
        if (style.borderBottomColor){
            this.insertProperty(
                new ColorProperty(
                    style,
                    Enums.ColorPropertyTypes.borderBottomColor
                )
            );
        }
        
        //If the rule has a borderLeftColor
        //property, insert it
        if (style.borderLeftColor){
            this.insertProperty(
                new ColorProperty(
                    style,
                    Enums.ColorPropertyTypes.borderLeftColor
                )
            );
        }
    }
    
    
    /**
     * Given a document, find all color properties
     * and consolidate them into a set of swatches,
     * one swatch per color (not per color instance).
     */
    this.insertDerivedSwatches = function(sourceDocument) {
        /**
         * Process all stylesheets,
         * looking for color properties to record in each
         * one
         */
        for(var i = 0; i < sourceDocument.styleSheets.length; i++){
            var rules = sourceDocument.styleSheets[i].cssRules;
            var style;
            
            /**
             * Process each rule in the stylesheet, looking
             * for color properties and recording them into
             * swatches in this palette
             */
            for(var j = 0; j < rules.length; j++){
                //Only process style rules, not things like
                //charset rules, etc.
                if (rules[j].style){
                    this.insertStyle(rules[j].style);
                }
                else {
                    //Probably an inport
                    //alert(rules[j]);
                    //dumpProps(rules[j]);
                }
                
            }
        }
        this.swatches.sort(Swatch.compareHueAndLightness);
    }
    this.insertDerivedSwatches(this.document);
}

