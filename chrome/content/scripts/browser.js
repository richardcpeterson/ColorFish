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
    this.widget.addProgressListener(new browserListener(),0xFFFFFFFF);
    
    /**
     * Hold reference to the address bar input
     */
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
    
    this.reload = function() {
        this.widget.reload();
    }
    
    this.forward = function() {
        if(this.widget.canGoForward)
            this.widget.goForward();
    }
    
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
    
    this.update_address_bar = function() {
        this.address_bar.value = this.widget.currentURI.spec;
    }
    
    this.update_back_forward_commands = function() {
        var backBroadcaster = document.getElementById("canGoBack");
        var forwardBroadcaster = document.getElementById("canGoForward");
        backBroadcaster.setAttribute("disabled", !this.widget.canGoBack);
        forwardBroadcaster.setAttribute("disabled", !this.widget.canGoForward);
    }
}


/**
 * Define a browser status listener that implements
 * nsIWebProgressListener.  This will let us handle
 * events in the browser.
 */
function browserListener () {
    this.count=0;

    this.onStateChange = function(aWebProgress, aRequest, aStateFlags, aStatus) {},
    this.onStatusChange = function(aWebProgress, aRequest, aStatus, aMessage) {},
    this.onProgressChange = function(aWebProgress, aRequest, aCurSelfProgress,
                          aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {},
    this.onSecurityChange = function(aWebProgress, aRequest, state) {},
    this.onLocationChange = function(aWebProgress, aRequest, aLocation)
    {
        this.count++;
        alert("browserListener.onLocationChange(): " + this.count);
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
