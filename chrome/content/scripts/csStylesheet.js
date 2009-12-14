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
    
    //List of DOM stylesheets that are imported
    //by this csStylesheet using @import rules
    this.importedSheets = new Array();

    this.addRule = function(rule) {
        this.rules.push(new csStylesheetRule(rule));
    }

    /**
     * Load all rules into the rules array, and all
     * imported stylesheets into the importedSheets
     * array
     */
    var DOMRules = this.originalSheet.cssRules;
        
    /**
     * Process each rule in the stylesheet
     */
    for (var i = 0; i < DOMRules.length; i++){
        //Only process style rules, not things like
        //charset rules, etc.
        if (DOMRules[i].style){
            this.addRule(DOMRules[i]);
        }
        else {
            //Add @import stylesheets to the
            //importedSheets array
            if (DOMRules[i].type == DOMRules[i].IMPORT_RULE
                && (DOMRules[i].styleSheet)){
                dump("importing a sheet...\n");
                this.importedSheets.push(DOMRules[i].styleSheet);
            }
        }
    }
}