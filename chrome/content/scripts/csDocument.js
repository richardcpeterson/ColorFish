
function csDocument(sourceDocument) {
    this.source = sourceDocument;

    this.LoadStyleSheets = function () {
        var sheetsToAdd = new Array();
        var sheets = new Array();

        
        /**
         * Put the initial list of stylesheets into
         * the list of sheets to add. More sheets
         * may be added later via @import rules
         */
        for (var i = 0; i < this.source.styleSheets.length; i++) {
            sheetsToAdd.push(this.source.styleSheets[i]);
        }

        /**
         * Process all stylesheets in sheetsToAdd,
         * adding each one to the list of sheets. If any
         * imported stylesheets are found, they will be
         * placed in sheetsToAdd as they are found.
         */
        while(sheetsToAdd.length > 0) {
            var sheet = sheetsToAdd.pop();
            if (sheet.cssRules) {
                sheets.push(new csStylesheet(sheet));
                //Add any stylesheets imported
                //by sheet into the list of sheets
                //that need to be added.
                sheetsToAdd = sheetsToAdd.concat(sheets.top().importedSheets);
            }
        }

        return sheets;
    }
    this.styleSheets = this.LoadStyleSheets();

    this.LoadPalette = function () {
        var palette = new Palette();

        this.styleSheets.forEach( function(sheet) {
            sheet.rules.forEach( function(rule) {
                palette.insertStyle(rule.style);
            });
        });

        palette.swatches.sort(Swatch.compareHueAndLightness);

        return palette;
    }

    this.Palette =  this.LoadPalette(this.source);

}