/***
 * Contains functions for manipulating the embedded browser.
 */

function load_page() {
    document.getElementById("browser")
        .loadURI( document.getElementById("url-bar").value );
}