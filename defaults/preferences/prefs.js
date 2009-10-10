// The locatiion of our primary UI, loaded when the application starts.
pref("toolkit.defaultChromeURI", "chrome://CSSchemer/content/xul/main.xul");

// Show Javascript warnings and errors if the application is started
// with the '-jsconsole' flag.
pref("javascript.options.showInConsole", true);
pref("javascript.options.strict", true);

// Allow using dump() to send out data if application is started
// with the '-console' flag.
pref("browser.dom.window.dump.enabled", true);

