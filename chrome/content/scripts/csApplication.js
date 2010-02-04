/**
 * CSApplication class
 */

function CSApplication(){
    this.activePage = "blank";
    this.cssFilePane = document.getElementById("cssFilePane");
    this.palettePane = document.getElementById("palettePane");
    this.toolPane = document.getElementById("toolPane");
    var csLeftPane = document.getElementById("csLeftPane");
    
    addHandlerToElement(csLeftPane, "keyup", leftPaneKeyUp);
    addHandlerToElement(csLeftPane, "mousedown", leftPaneMouseDown);

    this.appPanel = document.getElementById("appPanel");

    /**
     * Set the active page for the application
     */
    this.setActivePage = function(page){
        this.activePage = page;
        this.updateCSSFilePane();
        this.updatePalettePane();
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
    
    this.undo = function() {
        this.activePage.originalPalette.undo();
    }
    
    this.redo = function() {
        this.activePage.originalPalette.redo();
    }
    
    /**
     * Enable or disable the undo and / or redo command
     * based on the current availability of those actions
     */
    this.update_undo_redo_commands = function() {
        var undoCommand = document.getElementById("cmd_undo");
        var redoCommand = document.getElementById("cmd_redo");
        undoCommand.setAttribute("disabled", !this.canUndo);
        redoCommand.setAttribute("disabled", !this.canRedo);
    }
    
    /**
     * Is there an undo state available?
     */
    this.canUndo = function(){
        return this.activePage.originalPalette.canUndo();
    }
    
    /**
     * Is there a redo state available?
     */
    this.canRedo = function(){
        return this.activePage.originalPalette.canRedo();
    }


    /***
     * Update the GUI for the file pane, showing all needed controls
     * and a list of all CSS files
     */
    this.updateCSSFilePane = function () {

        //Remove all old children
        this.cssFilePane.removeAllChildren();

        // We use this in the forEach() below to enumerate embedded
        // sheets for easier reference by the user.
        var embeddedCount = 1;

        //Add new children
        this.activePage.styleSheets.forEach(
            function (item) {

                // We try to set the name in a few ways.
                //
                //     1. Using the 'title' attribute.
                //
                //     2. Using the 'href', removing everything up to
                //     and including the last forward slash.
                //
                //     3. Associating it with the title of the parent
                //     document from which it came.
                //
                // If all that fails we use a default value, which we
                // start out with, which hopefully we never use.  The
                // 'saveName' version is what we default to when
                // saving the file.

                var name     = "Unknown";
                var saveName = name;

                if (item.sheet.title) {
                    name = saveName = item.sheet.title;
                }
                else if (item.sheet.href) {
                    name = saveName = item.sheet.href.substr(
                        item.sheet.href.lastIndexOf("/") + 1,
                        item.sheet.href.length - 1
                    );

                    // The name may end with a query string, which we
                    // need to remove.
                    if (name.indexOf("?") > 0) {
                        name = saveName =
                            name.substr(0, name.indexOf("?"));
                    }
                }
                else if (item.sheet.ownerNode) {
                    if (item.sheet.ownerNode.ownerDocument.title) {
                        name     = "Embedded Sheet " + embeddedCount;
                        saveName = "embedded_sheet_" + embeddedCount + ".css";
                        embeddedCount++;
                    }
                }

                var node  = window.document.createElement("hbox");
                var label = window.document.createElement("label");

                label.setAttribute("value", name);
                label.setAttribute("tooltiptext", name);
                node.setAttribute("align", "center");

                var button = window.document.createElement("button");

                button.setAttribute("label", "Save");
                button.setAttribute(
                    "oncommand",
                    "csApp.save(this.styleSheet.getPrettyPrintText(), \"" + saveName + "\");"
                );

                // This cannot be 'item.sheet', or saving will fail.
                button.styleSheet = item;

                node.appendChild(button);
                node.appendChild(label);

                this.cssFilePane.appendChild(node);
            },
            this
        );
    };

    this.updatePalettePane = function(){
        //Remove all children
        while ( this.palettePane.childNodes.length >= 1 )
        {
           this.palettePane.removeChild( this.palettePane.firstChild );
        }
        var paletteControl = window.document.createElement("paletteControl");
        paletteControl.originalPalette = this.activePage.originalPalette;
        this.palettePane.appendChild(paletteControl);
    }
    
    this.updateToolPane = function (){
        //Remove all children
        while ( this.toolPane.childNodes.length >= 1 )
        {
           this.toolPane.removeChild( this.toolPane.firstChild );
        }
        var toolBox = window.document.createElement("toolBox");
        toolBox.originalPalette = this.activePage.originalPalette;
        this.toolPane.appendChild(toolBox);
    }

    /**
     * Toggle the visibility of the main app content pane
     */
    this.toggleAppPanel = function(){
        if(!this.appPanel.hasClass("collapsed")){
            this.hideAppPanel();
        }
        else{
            this.showAppPanel();
        }
    }

    /**
     * Make the main app content pane hidden
     */
    this.hideAppPanel = function(){
        this.appPanel.addClass("collapsed");
    }

    /**
     * Make the main app content pane visible
     */
    this.showAppPanel = function(){
        this.appPanel.removeClass("collapsed");
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
     * It takes a string and saves it to the file with the given name.
     */
    this.save = function (contents, fileName) {
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
    };
}

var csApp;