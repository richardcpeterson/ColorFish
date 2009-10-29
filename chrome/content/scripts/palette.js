/**
 * Palette class. Maintains a colecction of swatches,
 * and provides options for operating on those swatches.
 */

function Palette(sourceDocument){
    this.document = sourceDocument;
    this.swatches = deriveSwatches(sourceDocument);
    
    /**
     * Given a document, find all color properties
     * and condense them into a set of swatches,
     * one swatch per color (not per color instance).
     *
     * Returns an array of swatches
     */
    this.deriveSwatches = function(document) {
        //TODO: derive the swatches
        return new Array();
    }
}

