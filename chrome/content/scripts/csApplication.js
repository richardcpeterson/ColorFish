/**
 * CSApplication class
 */
 
function CSApplication(){
    this.activePage = "blank";
    this.cssFilePane = document.getElementById("cssFilePane");
    this.toolPane = document.getElementById("toolPane");
    
    //TEMP FUNCTION - alerts all stylesheets...
    this.alertRules = function(){
        var styleSheets = this.activePage.styleSheets;
        var daString = "";
        
        for (var i = 0; i < styleSheets.length; i++){
            var rules = styleSheets[i].cssRules;
            for (var j = 0; j < rules.length; j++){
                if (rules[j].cssText){
                    daString += rules[j].cssText;
                    daString += "\r\n\r\n";
                }
                else{
                    alert("cssText didn't exist...");
                }
            }
        }
        alert(daString);
    }
    
    /**
     * Set the active page for the application
     */
    this.setActivePage = function(page){
        this.activePage = page;
        this.updateCSSFilePane();
        this.updateToolPane();
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
            sheetName = "Stylesheet " + (i+1) + ": ";
            if (sheet.href){
                sheetName += sheet.href;
            }
            else{
                sheetName += "Inline " + sheet.type;
            }
            
            newNode = window.document.createElement("label");
            newNode.setAttribute("value", sheetName);
            this.cssFilePane.appendChild(newNode);
        }
    }
    
    this.updateToolPane = function(){
        //Remove all children
        while ( this.toolPane.childNodes.length >= 1 )
        {
           this.toolPane.removeChild( this.toolPane.firstChild );       
        }
        //Add new children
        var newNode;
        var label;
        var swatches = this.activePage.originalPalette.swatches;
        
        for (var i = 0; i < swatches.length; i++){
            this.toolPane.appendChild(this.makeSwatchControl(swatches[i]));
        }
        
    }
    
    this.makeSwatchControl = function(swatch){
        var hbox = window.document.createElement("hbox");
        var original = window.document.createElement("textbox");
        var textbox = window.document.createElement("textbox");
        var colorBox = window.document.createElement("box");
        var colorBox2 = window.document.createElement("box");
        var toolTip = "Found in " + swatch.count() + " style rule"
                    + (swatch.count()==1?"":"s");
        
        original.setAttribute(
            "value", swatch.color.toString()
        );
        original.setAttribute("class", "code");
        original.setAttribute("size", "10");
        original.setAttribute("readonly", "true");
        
        colorBox.setAttribute(
            "style",
            "background-color: " + swatch.color.getCSSHex());
        colorBox.setAttribute("class", "colorSwatch");
        
        colorBox2.setAttribute(
            "style",
            "background-color: " + swatch.color.getCSSHex());
        colorBox2.setAttribute("class", "colorSwatch hidden");
        
        
        textbox.setAttribute("value", swatch.color.toString());
        textbox.setAttribute("class", "code");
        textbox.setAttribute("size", "10");
        
        addHandlerToElement(
            textbox,
            "keyup",
            updateSwatchWithExplicitValue
        );
        
        hbox.swatch = swatch;
        
        hbox.setAttribute("align", "end");
        hbox.setAttribute("tooltiptext", toolTip);
        hbox.appendChild(original);
        hbox.appendChild(colorBox);
        hbox.appendChild(textbox);
        hbox.appendChild(colorBox2);
        //hbox.appendChild(button);
        return hbox;
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