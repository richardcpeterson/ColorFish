/**
 * CSApplication class
 */
 
function CSApplication(){
    this.activePage = "haha";
    this.cssFilePane = document.getElementById("cssFilePane");
    
    /**
     * Set the active page for the application
     */
    this.setActivePage = function(page){
        this.activePage = page;
        this.updateCSSFilePane();
    }
    
    this.updateCSSFilePane = function(){
        //Remove all children
        while ( this.cssFilePane.childNodes.length >= 1 )
        {
           this.cssFilePane.removeChild( this.cssFilePane.firstChild );       
        }
        //Add new children
        var newNode;
        var sheetName;
        var sheet;
        for (var i = 0; i < this.activePage.styleSheets.length; i++){
            sheet = this.activePage.styleSheets[i];
            sheetName = "Stylesheet " + (i+1) + ", ";
            if (sheet.href){
                sheetName += sheet.href;
            }
            else{
                sheetName += sheet.type;
            }
            
            newNode = window.document.createElement("label");
            newNode.setAttribute("value", sheetName);
            this.cssFilePane.appendChild(newNode);
        }
    }

}

function dumpProps(obj, parent) {
   // Go through all the properties of the passed-in object
   for (var i in obj) {
      // if a parent (2nd parameter) was passed in, then use that to
      // build the message. Message includes i (the object's property name)
      // then the object's property value on a new line
      if (parent) { var msg = parent + "." + i + "\n" + obj[i]; } else { var msg = i + "\n" + obj[i]; }
      // Display the message. If the user clicks "OK", then continue. If they
      // click "CANCEL" then quit this level of recursion
      if (!confirm(msg)) { return; }
      // If this property (i) is an object, then recursively process the object
      if (typeof obj[i] == "object") {
         if (parent) { dumpProps(obj[i], parent + "." + i); } else { dumpProps(obj[i], i); }
      }
   }
}

var csApp;