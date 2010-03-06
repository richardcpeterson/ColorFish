/***
 * [Class]  csRuleStyle
 *
 * Represents an individual rule from a stylesheet, but also keeps
 * track of its state, providing methods for changing and reverting
 * that state.  Objects are constructed from CSSStyleRule objects.
 *
 * [Public Interface]
 *
 * - property(foo)
 *
 *     Returns the property 'foo' from the style.
 *
 * - update(foo, color)
 *
 *     Sets the property 'foo' to the 'color' string.  The color
 *     should be a valid CSS color string.  Behavior is undefined if
 *     it is not.
 *
 * - redo()
 *
 *     Reverts the rule to its last state.
 *
 */
function csRuleStyle(style) {
    this.style = style;
}

csRuleStyle.prototype.property = function (property) {
    return this.style[property];
};

csRuleStyle.prototype.update = function (property, colorString) {
    this.style[property] = colorString;
};

csRuleStyle.prototype.redo = function () {
    if (this.redoList.top()) {
        this.undoList.push( this.undoList.top()[0], this.style[ this.redoList.top()[0] ] );
        this.style[ this.redoList.top()[0] ] = this.redoList.pop()[1];
    }
};

/***
 * [Class]  csStyleSheet
 *
 * Encapsulates a stylesheet---particularly, a CSSStyleSheet object,
 * which is the sole argument of the constructor.  Provides access to
 * the contents of a stylesheet, along with ways of ouptutting that
 * stylesheet in particular formats.
 *
 * [Public Interface]
 *
 * - addRule(rule)
 *
 *     Takes a CSSStyleRule and associates it with the stylesheet.
 *
 * - getPrettyPrintText()
 *
 *     Returns a string representing a pretty-printed version of the
 *     style sheet.  This string will be empty if the sheet has no
 *     associated rules.  Imported style sheets are not handled.
 *
 * - getOriginalText()
 *
 *     Returns a string containing the original, unmodified CSS text.
 *     There is a possibility that the function will throw an
 *     exception; it makes an XML HTTP request to fetch the
 *     stylesheet, and this can fail.  If the request is successful
 *     there is still a chance that we may not get back CSS.  In that
 *     case the function returns nothing.
 *
 */
function csStyleSheet(sheet) {
    this.sheet = sheet;
    this.rules = [];
    this.importedSheets = [];

    // This regular expression is used in the loop below for
    // extracting the value out of @import URLs.  If it matches then
    // the first captured group will be the path to the sheet being
    // imported.  If that path begins with './' then that will be
    // removed.
    var importURLRegex = /^@import url\((?:\.\/)?(.+)\);$/i;

    // Loop through the sheet we were given and add all of the rules.
    // Also check for stylesheets that are @import'ed and store those
    // within our object.
    Array.forEach(
        this.sheet.cssRules, function (rule) {
            if (rule.style) {
                this.addRule(rule);
            }
            else if (rule.type === rule.IMPORT_RULE && rule.styleSheet) {
                var nestedSheet = rule.styleSheet;
                var match       = importURLRegex.exec(rule.cssText);

                if (match) {
                    this.importedSheets.push(nestedSheet);
                }
            }
        },
        this
    );
}

csStyleSheet.prototype.addRule = function (rule) {
    this.rules.push(new csRuleStyle(rule.style));
};

csStyleSheet.prototype.getPrettyPrintText = function () {
    var output = "";

    if (!this.sheet.cssRules) {
        return output;
    }

    this.rules.forEach(
        function (rule) {
            if (rule.style.cssText) {
                output += rule.style.parentRule.selectorText + " {\n";
                output += "\t" + rule.style.cssText + "\n}\n\n";
            }
        }
    );

    return output.replace(/; /g, ";\n\t");
};

csStyleSheet.prototype.getOriginalText = function () {

    // If the sheet has an owner node and does not have an href or
    // src attribute then we are dealing with embedded <style>
    // content.
    if (    this.sheet.ownerNode
            && !this.sheet.ownerNode.getAttribute("src")
            && !this.sheet.ownerNode.href ) {
        return this.sheet.ownerNode.innerHTML;
    }

    // Check to see if exists directly in the href.
    if (this.sheet.href.substr(0, 13) === "data:text/css") {
        return unescape(this.sheet.href.slice(14));
    }

    // Otherwise we're going to fetch the file sychronously with
    // Ajax (SJax)?
    var request = new XMLHttpRequest();
    request.open("GET", this.sheet.href, false);
    request.overrideMimeType("text/plain");
    request.send(null);

    switch (request.status) {
    case 0:    // Local
    case 304:  // Not Modified
        return request.responseText;
        break;

        // Just because we have a status of 200 everything may not
        // actually be OK.  Some websites will redirect to other
        // pages instead of sending back a 404 when accessing a
        // missing page.  If we try to load a stylesheet that
        // isn't really there we can end up with
        // request.responseText containing all the markup for some
        // arbitrary web page.
        //
        // So we have to make sure our content is really CSS
        // before handing it back.
    case 200:
        if (request.responseText.isValidStylesheet()) {
            return request.responseText;
        }
        break;
    }
};
