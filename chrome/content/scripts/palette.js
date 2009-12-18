/**
 * Palette class. Maintains a colecction of swatches,
 * and provides options for operating on those swatches.
 */

function Palette(){
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

        properties.forEach( function(property) {
            if (style && style.property(property)) {
                palette.insertProperty(
                    new ColorProperty(style, property)
                );
            }
        });
    }
}

