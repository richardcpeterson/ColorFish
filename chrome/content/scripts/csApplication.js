/*********************************************************************
 *
 * CSApplication
 *
 * This class implements the overall user-interface functionality of
 * CSSchemer.  For instance, it is responsible for updating many of
 * the panes, and for providing general functionality like opening
 * file dialogs.  However, note that the specific contents of the
 * application panes are handled elsewhere; e.g. while this class
 * takes care of clearing out and refreshing the palette pane, it is
 * not responsible for the actual implementation of that palette.
 *
 * Included in this file is a global variable called 'csApp', which is
 * the global instance of CSApplication that we use throughout the
 * program.
 *
 *********************************************************************/

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

        //We want to be notified of changes to the palette.
        //As of yet, palette history is the only history for
        //which global undo/redo is supported.
        this.activePage.originalPalette.addHistoryObserver(this);
        this.update_undo_redo_commands();
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

    this.updatePaletteHistory = function(palette){
        this.update_undo_redo_commands();
    }

    /**
     * Enable or disable the undo and / or redo command
     * based on the current availability of those actions
     */
    this.update_undo_redo_commands = function() {
        var undoCommand = document.getElementById("cmd_undo");
        var redoCommand = document.getElementById("cmd_redo");
        undoCommand.setAttribute("disabled", !this.canUndo());
        redoCommand.setAttribute("disabled", !this.canRedo());
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
                label.setAttribute("tooltiptext", saveName);
                label.setAttribute("crop", "center");
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

    this.updatePalettePane = function () {
        this.palettePane.removeAllChildren();
        var paletteControl = window.document.createElement("paletteControl");
        paletteControl.originalPalette = this.activePage.originalPalette;
        this.palettePane.appendChild(paletteControl);
    };

    this.updateToolPane = function () {
        this.toolPane.removeAllChildren();
        var toolBox = window.document.createElement("toolBox");
        toolBox.originalPalette = this.activePage.originalPalette;
        this.toolPane.appendChild(toolBox);
    };

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

    /**
     * Pops up a dialog for selecting a file from the local computer.
     * The arguments are:
     *
     *     mode: Either Components.interfaces.nsIFilePicker.modeSave
     *     or Components.interfaces.nsIFilePicker.modeOpen.
     *     Determines whether we are using the file for saving or
     *     opening.
     *
     *     caption: The title we display on the file dialog to explain
     *     the purpose of the file, e.g. "File to Save".
     *
     *     filters: An array of strings indicating the types of files
     *     which the dialog should accept.  Look at the properties of
     *     filterDefinitions below for a list of valid values for this
     *     array, e.g. ["html", "css"].
     *
     *     defaultFileName: The default filename to use.
     *
     * This function returns an nsILocalFile object representing the
     * user's choice, or it will return nothing.
     */
    this.chooseLocalFile = function (mode, caption, filters, defaultFileName) {
        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var picker        = Components.classes["@mozilla.org/filepicker;1"].createInstance( nsIFilePicker );

        var filterDefinitions = {
            "all":  [ "All Files", "*"                  ],
            "css":  [ "Cascading Style Sheets", "*.css" ],
            "html": [ "HTML Documents", "*.htm; *.html" ]
        };

        picker.init(window, caption, mode);
        picker.defaultString = defaultFileName;

        filters.forEach( function (f) {
            if (filterDefinitions[f]) {
                picker.appendFilter( filterDefinitions[f][0], filterDefinitions[f][1] );
            }
        });

        var result = picker.show();

        switch (result) {
        case nsIFilePicker.returnOK:
        case nsIFilePicker.returnReplace:
            return picker.file;

        default:
            return;
        }
    };

    /***
     * This is called by the File -> Save option from the main menu.
     * It takes a string and saves it to the file with the given name.
     */
    this.save = function (contents, fileName) {
        var file = this.chooseLocalFile(
            Components.interfaces.nsIFilePicker.modeSave,
            "Select A File",
            ["css", "all"],
            fileName
        );

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

    /**
     * Opens a file dialog that allows the user to select a local HTML
     * file to manipulate with CSSchemer.  Once selected, that file is
     * loaded in the browser.  If they cancel the operation then we
     * just quietly exit without doing anything.
     */
    this.open = function () {
        var file = this.chooseLocalFile(
            Components.interfaces.nsIFilePicker.modeOpen,
            "Select A File",
            ["html"]
        );

        if (file) {
            Browser.load_page(file.path);
        }
    };
}

var csApp;