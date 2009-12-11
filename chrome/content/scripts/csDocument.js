
function csDocument(sourceDocument) {
    this.source = sourceDocument;

    this.LoadStyleSheets = function () {
        //var stack = this.source.styleSheets;
        var stack = new Array();
        var sheets = new Array();

        // For now, wrap stylesheets into an array
        for (i = 0; i < this.source.styleSheets.length; i++) {
            stack.push(this.source.styleSheets[i]);
        }

        /**
         * Process all stylesheets,
         * looking for color properties to record in each
         * one
         */
        while(stack.length > 0) {
            if (stack.top().cssRules) {
                sheets.push(new csStylesheet(stack.pop()));
                stack.push(sheets.top().loadRules());
            } else stack.pop();
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