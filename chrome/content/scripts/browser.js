/***
 * This file creates a class for interacting with the browser embedded
 * inside of the application interface.  We also create a global
 * instance of this class called 'Browser' for all interactions
 * outside of this file.
 */

function Browser() {

    /***
     * The <browser> element inside our XUL document.  Because we go
     * ahead and call getElementById() here we need to make sure that
     * this file is not included via <script> until after the
     * <browser> element we want to use for our source.
     */
    this.widget = document.getElementById("browser");
    
    //Listen to events occurring in the browser, so
    //we can update the GUI
    //Don't make the progress listener anonymous.
    //It causes a the listener to get dropped.
    this.progressListener = new browserListener();
    this.widget.addProgressListener(this.progressListener,0xFFFFFFFF);
    
    //Reference to the address bar input
    this.address_bar = document.getElementById("uri-input");
    
    /***
     * Takes a URL as a string and loads that page.
     */
    this.load_page = function(url) {
        this.widget.loadURI(url);
    }

    /***
     * Loads the URL in the address bar.
     */
    this.load_from_address_bar = function() {
        this.load_page(
            this.address_bar.value
        );
    }
    
    /**
     * Reload the current page
     */
    this.reload = function() {
        this.widget.reload();
    }
    
    /**
     * Go forward in browser history
     */
    this.forward = function() {
        if(this.widget.canGoForward)
            this.widget.goForward();
    }
    
    /**
     * Go back in browser history
     */
    this.back = function() {
        if (this.widget.canGoBack)
            this.widget.goBack();
    }

    /***
     * Returns a StyleSheetList representing all of the style sheets
     * attached to the current page we're viewing in the browser.
     */
    this.get_stylesheets = function() {
        return this.widget.contentDocument.styleSheets;
    }
    
    /**
     * Returns the content document currently being
     * viewed in the browser
     */
    this.get_document = function(){
        return this.widget.contentDocument;
    }
    
    /**
     * Update the active page for the application.
     * Could probably go to an observer pattern with
     * this...
     */
    this.update_active_page = function() {
        csApp.setActivePage(new Page(this.get_document()));
    }
    
    /**
     * Cause the address bar to reflect the URI of the
     * current page being viewed
     */
    this.update_address_bar = function() {
        this.address_bar.value = this.widget.currentURI.spec;
    }
    
    /**
     * Disable or enable the back and forward commands
     * depending on whether there is any browsing
     * history forward or backward
     */
    this.update_back_forward_commands = function() {
        var backCommand = document.getElementById("cmd_browseBack");
        var forwardCommand = document.getElementById("cmd_browseForward");
        backCommand.setAttribute("disabled", !this.widget.canGoBack);
        forwardCommand.setAttribute("disabled", !this.widget.canGoForward);
    }
}


/**
 * Define a browser status listener that implements
 * nsIWebProgressListener.  This will let us handle
 * events in the browser.
 */
function browserListener () {
    this.currentRequest;
    
    var nsI = Components.interfaces.nsIWebProgressListener;
    this.STATE_DONE = nsI.STATE_STOP
                    + nsI.STATE_IS_NETWORK
                    + nsI.STATE_IS_WINDOW;
    
    this.onStateChange = function(aWebProgress, aRequest, aStateFlags, aStatus) {
        if (aRequest == this.currentRequest
        && ((aStateFlags & this.STATE_DONE) == this.STATE_DONE)) {
            Browser.update_active_page();
        }
    },
    this.onStatusChange = function(aWebProgress, aRequest, aStatus, aMessage) {},
    this.onProgressChange = function(aWebProgress, aRequest, aCurSelfProgress,
                          aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {},
    this.onSecurityChange = function(aWebProgress, aRequest, state) {},
    this.onLocationChange = function(aWebProgress, aRequest, aLocation)
    {
        this.currentRequest = aRequest;
        Browser.update_back_forward_commands();
        Browser.update_address_bar();
    },
    
    this.QueryInterface = function(aIID)
    {
        if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
            aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
            aIID.equals(Components.interfaces.nsIXULBrowserWindow) ||
            aIID.equals(Components.interfaces.nsISupports))
            return this;
        throw Components.results.NS_NOINTERFACE;
    },
    this.setJSStatus = function(status) {},
    this.setJSDefaultStatus = function(status) {},
    this.setOverLink = function(link) {}
}

//Declare a global browser, to be initialized later
var Browser;
