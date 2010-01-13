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

    this.property = function (property) {
        return this.style[property];
    };

    this.update = function (property, colorString) {
        this.style[property] = colorString;
    };

    this.redo = function () {
        if (this.redoList.top()) {
            this.undoList.push( this.undoList.top()[0], this.style[ this.redoList.top()[0] ] );
            this.style[ this.redoList.top()[0] ] = this.redoList.pop()[1];
        }
    };
}

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
 *
 * - getPrettyPrintText()
 *
 *     Returns a string representing a pretty-printed version of the
 *     style sheet.  This string will be empty if the sheet has no
 *     associated rules.  Imported style sheets are not handled.
 *
 */
function csStyleSheet(sheet) {
    this.sheet = sheet;
    this.rules = [];
    this.importedSheets = [];

    this.addRule = function (rule) {
        this.rules.push(new csRuleStyle(rule.style));
    };

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

    this.getPrettyPrintText = function () {
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
}
