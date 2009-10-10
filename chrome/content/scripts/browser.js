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
            document.getElementById("url-bar").value
        );
    }

}

/***
 * Our global browser instance.
 */
var Browser = new Browser();
