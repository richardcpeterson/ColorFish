
function csDocument(sourceDocument) {
    this.source = sourceDocument;

    this.LoadStyleSheets = function () {
        var sheetsToAdd = new Array();
        var csStyleSheets = new Array();

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

            if (sheet && sheet.cssRules) {
                //Add a new csStyleSheet
                var csSheet = new csStyleSheet(sheet);
                var imports = csSheet.importedSheets;

                csStyleSheets.push(csSheet);

                //Add any imported stylesheets to sheetsToAdd
                //This has the effect of creating a flat
                //list of sheets in csStyleSheets
                sheetsToAdd = sheetsToAdd.concat(imports);
            }
        }

        return csStyleSheets;
    }
    this.styleSheets = this.LoadStyleSheets();

    this.LoadPalette = function () {
        var palette = new Palette();

        this.styleSheets.forEach( function(sheet) {
            sheet.rules.forEach( function(rule) {
                palette.insertRule(rule);
            });
        });

        palette.sortByClusters();

        return palette;
    }

    this.Palette =  this.LoadPalette(this.source);

}