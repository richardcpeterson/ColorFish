/*************************************
 * GENERAL SETTINGS
 ************************************/
// The location of our primary UI, loaded when the application starts.
pref("toolkit.defaultChromeURI", "chrome://ColorFish/content/xul/main.xul");



/*************************************
 *  DEVELOPMENT SETTINGS
 ************************************/
//TODO - these are development settings. We either need
//To do some sort of conditional build or remember to
//manually take these out

// Show Javascript warnings and errors if the application is started
// with the '-jsconsole' flag.
pref("javascript.options.showInConsole", true);
pref("javascript.options.strict", true);

pref("nglayout.debug.disable_xul_cache", true);
pref("nglayout.debug.disable_xul_fastload", true);

// Allow using dump() to send out data if application is started
// with the '-console' flag.
pref("browser.dom.window.dump.enabled", true);
pref("browser.cache.disk.enable", false);
