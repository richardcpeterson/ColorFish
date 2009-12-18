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
                "csApp.save((this.styleSheet.getPrettyPrintText()),'" + sheetName + "');");
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
        var swatchControl = window.document.createElement("swatchControl");
        
        //The constructor for the swatch element has
        //not yet been called. It only
        //gets called when the stylesheet is read and
        //the XBL binding is bound.  Thus we can't
        //call any methods defined in the binding,
        //like "setSwatch()", here.
        //Instead, we do the following kludge to pass
        //the swatch to the constructor.
        swatchControl.originalSwatch = swatch;
        
        return swatchControl;
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
}

var csApp;