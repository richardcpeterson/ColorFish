/**
 * Palette class. Maintains a colecction of swatches,
 * and provides options for operating on those swatches.
 */

function Palette(sourceDocument){
    this.document = sourceDocument;
    
    /**
     * Given a document, find all color properties
     * and condense them into a set of swatches,
     * one swatch per color (not per color instance).
     *
     * Returns an array of swatches
     */
    this.deriveSwatches = function(document) {
        
        
        var message = "";
        
        /**
         * Process all stylesheets,
         * looking for color properties to record in each
         * one
         */
        for(var i = 0; i < document.styleSheets.length; i++){
            var rules = document.styleSheets[i].cssRules;
            var style;
            
            /**
             * Process each rule in the stylesheet, looking
             * for color properties and recording them
             */
            for(var j = 0; j < rules.length; j++){
                style = rules[j].style;
                
                message += rules[j].selectorText + "{  \t";
                if (style.color)
                    message += "color: " + style.color + "; ";
                if (style.backgroundColor)
                    message += "background-color: " + style.backgroundColor + "; ";
                if (style.borderTopColor)
                    message += "border-top-color: " + style.borderTopColor + "; ";
                if (style.borderRightColor)
                    message += "border-right-color: " + style.borderRightColor + "; ";
                if (style.borderBottomColor)
                    message += "border-bottom-color: " + style.borderBottomColor + "; ";
                if (style.borderLeftColor)
                    message += "border-left-color: " + style.borderLeftColor + "; ";
                message += " }\n";   
            }
        }
        alert(message);
        
        //List all the color properties
        
        /**
         * Insert each color property into this palette,
         * adding to the appropriate swatch where necessary
         */
        
        
        return new Array();
    }
    
    this.swatches = this.deriveSwatches(sourceDocument);
    
    
}

