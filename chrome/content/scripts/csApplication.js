/**
 * CSApplication class
 */

function CSApplication(){
    this.activePage = "blank";
    this.cssFilePane = document.getElementById("cssFilePane");
    this.toolPane = document.getElementById("toolPane");

    /**
     * Set the active page for the application
     */
    this.setActivePage = function(page){
        this.activePage = page;
        this.updateCSSFilePane();
        this.updateToolPane();
    }

    /***
     * Quits the application.
     */
    this.quit = function() {
        Components.classes['@mozilla.org/toolkit/app-startup;1']
            .getService(Components.interfaces.nsIAppStartup)
            .quit(Components.interfaces.nsIAppStartup.eAttemptQuit);
    };


    /* Update the GUI for the file pane, showing all
     * needed controls and a list of all CSS files
     */
    this.updateCSSFilePane = function() {
        //Remove all old children
        this.cssFilePane.removeAllChildren();

        //Add new children
        var newNode, label, fullName, sheetName, sheet, saveButton;
        var inlineNumber = 0;

        //Process each stylesheet, building a UI
        //element for each one
        for (var i = 0; i < this.activePage.styleSheets.length; i++){
            sheet = this.activePage.styleSheets[i];
            fullName = "Stylesheet " + (i+1) + ": ";

            //Create the strings for the sheet labels
            if (sheet.href){
                fullName += sheet.href;
                var startIndex = sheet.href.lastIndexOf("/");
                startIndex++;
                sheetName = sheet.href.substr(startIndex, sheet.href.length-1);
            }
            else{
                inlineNumber++;
                fullName += "Inline " + sheet.type;
                sheetName = "style_tag_" + inlineNumber + ".css";
            }

            newNode = window.document.createElement("hbox");
            label = window.document.createElement("label");
            label.setAttribute("value", sheetName);
            newNode.setAttribute("tooltiptext", fullName);
            newNode.setAttribute("align", "center");

            saveButton = window.document.createElement("button");
            saveButton.setAttribute("label","Save");
            saveButton.setAttribute(
                "oncommand",
                "csApp.save(csApp.getStyleSheetSource(this.styleSheet),'" + sheetName + "');");
            saveButton.styleSheet = sheet;
            newNode.appendChild(saveButton);
            newNode.appendChild(label);
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

    /**
     * Make an individual swatch control within the palette
     * display.
     */
    this.makeSwatchControl = function(swatch){
        //Parent element for the whole control
        var hbox = window.document.createElement("hbox");
        
        var original = window.document.createElement("textbox");
        var textbox = window.document.createElement("textbox");
        var colorBox = window.document.createElement("box");
        var colorBox2 = window.document.createElement("box");
        var toolTip = "Found in " + swatch.count() + " style rule"
                    + (swatch.count()==1?"":"s");

        var undoButton = window.document.createElement("button");
        var redoButton = window.document.createElement("button");

        //Set up the original swatch text box
        original.setAttribute(
            "value", swatch.color.toString()
        );
        original.setAttribute("class", "code");
        original.setAttribute("size", "10");
        original.setAttribute("readonly", "true");

        //Set up the original color box
        colorBox.setAttribute(
            "style",
            "background-color: " + swatch.color.getCSSHex());
        colorBox.setAttribute("class", "colorSwatch");

        //Set up the modified swatch color box
        colorBox2.setAttribute(
            "style",
            "background-color: " + swatch.color.getCSSHex());
        colorBox2.setAttribute("class", "colorSwatch hidden");


        //Set up the input box
        textbox.setAttribute("value", swatch.color.toString());
        textbox.setAttribute("class", "code");
        textbox.setAttribute("size", "10");

        //Add textbox input handler
        addHandlerToElement(
            textbox,
            "input",
            updateSwatchWithExplicitValue
        );


        undoButton.setAttribute("label","Undo");
        undoButton.setAttribute("class","undoButton");
        addHandlerToElement(
            undoButton,
            "command",
            undoSwatch
        );
        
        redoButton.setAttribute("label","Redo");
        redoButton.setAttribute("class","redoButton");
        addHandlerToElement(
            redoButton,
            "command",
            redoSwatch
        );

        //Build the final element
        hbox.setAttribute("align", "end");
        hbox.setAttribute("tooltiptext", toolTip);
        hbox.appendChild(original);
        hbox.appendChild(colorBox);
        hbox.appendChild(textbox);
        hbox.appendChild(colorBox2);
        hbox.appendChild(undoButton);
        hbox.appendChild(redoButton);
        
        //Set all the related objects
        hbox.addRelatedObject("undoButton",undoButton);
        hbox.addRelatedObject("inputTextbox",textbox);
        hbox.addRelatedObject("swatch",swatch);
        hbox.addRelatedObject("originalColorTextbox",original);
        hbox.addRelatedObject("originalColorBox",colorBox);
        hbox.addRelatedObject("modifiedColorBox",colorBox2);
        
        /**
         * Update the GUI to reflect the state of the
         * attached swatch object hbox.relatedOjbects.swatch
         */
        hbox.updateControl = function() {
            //Input element
            var textbox = this.relatedObjects.inputTextbox;
            var swatch = this.relatedObjects.swatch;
            var newColor = this.relatedObjects.swatch.color;
            
            /**
             * Show and hide the modified swatch. Show the swatch
             * when it is different from the original swatch.
             * Hide it when it is the same as the original swatch.
             */
            var swatch1 = this.relatedObjects.originalColorBox;
            var swatch2 = this.relatedObjects.modifiedColorBox;
            //If the new color is the same as the original color
            if (Color.from_css(swatch1.style.backgroundColor).equals(newColor)){
                swatch2.addClass("hidden");
            }
            //The new color is different from the original color
            else {
                //Make the swatch the new background color
                swatch2.setAttribute(
                    "style",
                    "background-color: " + newColor.getCSSHex());
                swatch2.removeClass("hidden");
            }
            
            //Valid color
            textbox.removeClass("invalid");
        }
        
        /**
         * Update the input field with a new color string
         * representing the current state of the attached
         * swatch object.
         */
        hbox.updateInputField = function() {
            var textbox = this.relatedObjects.inputTextbox;
            var swatch = this.relatedObjects.swatch;
            textbox.value = swatch.color.toString(swatch.format);
        }

        return hbox;
    }

    /***
     * Opens a dialog box for saving a file.  This will return either
     * an nsILocalFile object representing the file to be saved to, or
     * a null value if the user decides to cancel the save operation.
     *
     * By default the save dialog will appear with only the option to
     * save CSS files, but the user can choose to save any file if he
     * likes.
     */
    this.getSaveFile = function(fileName) {
        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var picker        = Components.classes["@mozilla.org/filepicker;1"].createInstance( nsIFilePicker );

        picker.init(window, "Select a File", nsIFilePicker.modeSave);
        picker.appendFilter("Cascading Style Sheets", "*.css");
        picker.appendFilter("All Files", "*");
        picker.defaultString = fileName;

        var result = picker.show();

        switch (result) {
            case nsIFilePicker.returnOK:
            case nsIFilePicker.returnReplace:
            return picker.file;
            break;

            case nsIFilePicker.returnCancel:
            return null;
            break;
        }
    }

    /***
     * This is called by the File -> Save option from the main menu.
     * It currently saves a test string to the output.
     */
    this.save = function(contents, fileName) {
        var file = this.getSaveFile(fileName);

        if (file) {
            var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
		.createInstance( Components.interfaces.nsIFileOutputStream );

            // Open the file for read-write, and overwrite the
            // contents of the file if it already exists.
            outputStream.init(file, 0x04 | 0x08 | 0x20, 420, 0);

            outputStream.write(contents, contents.length);
            outputStream.close();
        }
    }


    this.getStyleSheetSource = function(styleSheet) {
        var output = "";
        if(styleSheet.cssRules){
            for (var j = 0; j < styleSheet.cssRules.length; j++){
                if (styleSheet.cssRules[j].cssText){
                    output += styleSheet.cssRules[j].cssText;
                    output += "\r\n\r\n";
                }
            }
        }
        else{
            output = "Could not generate stylesheet output";
        }

        //Pretty format
        output = output.replace(/{ /g, "{\n    ");
        output = output.replace(/; /g, ";\n    ");
        output = output.replace(/    }/g, "}");

        return output;
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