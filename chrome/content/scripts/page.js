/***
 * Class for maintaining information
 * about and modifying a browsed webpage. This should
 * not be confused with the browser, which renders
 * pages and navigates between them. 
 */

function Page(contentDocument) {
    this.document = null;
    this.originalPalette = null;
    this.resultPalette = null;
    this.styleSheets = null;
    
    if (contentDocument){
        this.document = contentDocument;
        this.originalPalette = new Palette(this.document);
        //this.resultPalette = new Palette(this.document);
        //this.resultPalette = originalPalette.clone();
        this.styleSheets = this.document.styleSheets;
    }
}

