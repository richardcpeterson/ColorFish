function csStylesheetRule(rule) {
    this.originalRule = rule;
    this.style = new csRuleStyle(rule.style);


}

    function csRuleStyle(style) {
        this.originalStyle = style;
        this.currentStyle = style;

        this.property = function(property) {
            return this.currentStyle[property];
        }

        this.update = function(property, colorString) {
            this.currentStyle[property] = colorString;
        }

        // Not tested yet
        this.redo = function() {
            if ( this.redoList.top() ) {
                this.undoList.push(this.undoList.top()[0], this.currentStyle[this.redoList.top()[0]]);
                this.currentStyle[this.redoList.top()[0]] = this.redoList.pop()[1];
            }
        }

        // Don't use this if you don't absolutely need to
        this.get = function() {
            return this.currentStyle;
        }
    }

function csStylesheet(sheet) {
    this.originalSheet = sheet;
    this.href = sheet.href;
    // this.locked = boolean;
    this.rules = new Array();

    this.addRule = function(rule) {
        this.rules.push(new csStylesheetRule(rule));
    }

    /**
     * Given a document, find all color properties
     * and consolidate them into a set of swatches,
     * one swatch per color (not per color instance).
     */
    this.loadRules = function() {
        var importRules = this.originalSheet.cssRules;
        var importList = new Array();

        /**
         * Process each rule in the stylesheet, looking
         * for color properties and recording them into
         * swatches in this palette
         */
        for (var i = 0; i < importRules.length; i++){
            //Only process style rules, not things like
            //charset rules, etc.
            if (importRules[i].style){
                // this.rules.push(new csStylesheetRule(importRules[i]));
                this.addRule(importRules[i]);
            }
            else {
                //Recursively insert stylesheets
                //imported via CSS @import
                //but do not import if a loop is detected
                //(the stylesheet to be added is already
                //in the list)
                if (importRules[i].type == importRules[i].IMPORT_RULE
                    && (importRules[i].styleSheet)){
                    importList.push(importRules[i].stylesheet);
                }
            }
        }

        return importList;
    }

}