/**
 * Palette class. Maintains a colecction of swatches,
 * and provides options for operating on those swatches.
 */

function Palette(sourceDocument){
    this.document = sourceDocument;
    this.styleSheets = new Array();
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

        properties.forEach( function(p) {
            if (style[p]) {
                palette.insertProperty(
                    new ColorProperty(style, Enums.ColorPropertyTypes[p])
                );
            }
        });
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
            this.insertStyleSheet(sourceDocument.styleSheets[i]);
        }
        this.swatches.sort(Swatch.compareHueAndLightness);
    }

    /**
     * Insert all style rules from this stylesheet
     * and its @import descendents
     */
    this.insertStyleSheet = function(styleSheet){
        //Add the stylesheet to the list of stylesheets
        //referenced by this palette
        this.styleSheets.push(styleSheet);

        var rules = styleSheet.cssRules;

        /**
         * Process each rule in the stylesheet, looking
         * for color properties and recording them into
         * swatches in this palette
         */
        for(var i = 0; i < rules.length; i++){
            //Only process style rules, not things like
            //charset rules, etc.
            if (rules[i].style){
                this.insertStyle(rules[i].style);
            }
            else {
                //Recursively insert stylesheets
                //imported via CSS @import
                //but do not import if a loop is detected
                //(the stylesheet to be added is already
                //in the list)
                if (rules[i].type == rules[i].IMPORT_RULE
                    && (rules[i].styleSheet)){
                    this.insertStyleSheet(rules[i].styleSheet);
                }
            }
        }
    }

    this.insertDerivedSwatches(this.document);
}

