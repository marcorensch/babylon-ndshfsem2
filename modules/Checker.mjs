import {Row} from "./Row.mjs";

class KeyChecker {
    type = "key"
    /* See https://regex101.com/ for testing regular expressions */

    /**
     * Checks if the given String is all uppercase
     * @param string
     * Related article: https://bobbyhadz.com/blog/javascript-check-if-string-is-all-uppercase
     */
    static allUppercase(string) {
        let status = string.toUpperCase() === string && string !== string.toLowerCase()
        let msg = status ? '' : "lowercase character(s) found"
        let hint = status ? '' : `Key Values needs to be all in uppercase<br>Good:<code>KEY_FOR_STRING</code><br>Bad: <code>key_for_string</code>`
        return new CheckResult(status, 'key', msg, hint)
    }

    /**
     * checks if the given string contains only characters (A-Z0-9) and _
     * (https://regex101.com/r/ZksJD1/1)
     * @param string
     * Note: valide mit Small letters damit dieser Fehler hier nicht matched!
     */
    static validCharacters(string) {
        let status = /^[_a-z\d]+$/i.test(string)
        let msg = status ? '' : "Invalid characters found"
        let hint = status ? '' : 'Key values may only contain the characters A-Z,0-9 or _.'
        return new CheckResult(status, 'key', msg, hint)
    }
}

class ValueChecker {
    static encapsulated(string) {
        string = string.trim()
        let status = /^".*"$/.test(string)
        let msg = status ? '' : 'Value is not correctly encapsulated by ".'
        let hint = status ? '' : `Value Strings needs to be encapsulated by double quotes ".<br>Good:<code>"My value String"</code>Bad:<code>My value String</code><code>'My value String'</code>`
        return new CheckResult(status, 'value', msg, hint)
    }

    static lastCharIsNotEscaped(string) {
        string = string.trim()
        let status = !/\\"$/.test(string)
        let msg = status ? '' : 'Last sign in String is a \\'
        let hint = status ? '' : 'no backslash may be used in the last position of the string.'
        return new CheckResult(status, 'value', msg, hint)
    }

    static doubleQuotesEscaped(string) {
        string = string.trim()
        let status = !/(?<!\\)"/.test(string.slice(1, -1));
        let msg = status ? '' : 'Unescaped Double Quotes found.'
        let hint = status ? '' : `Double quotes in value strings must be escaped by backslashs.<br>Good: <code>&lt;div class=&#92;&quot;foo&#92;&quot;&gt;foo&lt;/div&gt;</code><br>Bad:<code>&lt;div class=&quot;foo&quot;&gt;foo&lt;/div&gt;</code>`
        return new CheckResult(status, 'value', msg, hint)
    }
}

class RowCheck {
    valueChecks;
    keyChecks;
    generalChecks;

    constructor(generalChecks, keyChecks, valueChecks) {
        this.generalChecks = generalChecks;
        this.valueChecks = valueChecks;
        this.keyChecks = keyChecks;
    }
}


class Checker {
    /**
     *
     * @param rows  Array of Strings
     * @return  Array of { Row, RowChecks }
     */
    static checkRows(rows) {
        // Checker Result only contains ROW items of rows with errors
        let checkerResults = []
        let rowNum = 1
        for (const rowString of rows) {
            let rowObj = new Row(rowNum, rowString)
            rowObj.checks = this.checkRow(rowObj)
            // Push if errors found
            let arrOfErrors = this.getFails(rowObj.checks, rowNum);
            if (arrOfErrors.length > 0) {
                checkerResults = checkerResults.concat(arrOfErrors)
            }
            rowNum++
        }
        return {count: rows.length, checkerResults}
    }

    /**
     * @param   row     Row Object
     */
    static checkRow(row) {
        let keyChecks, valueChecks, formatChecks
        formatChecks = {
            string: row.string,
            checks: {
                lineFormatting: {status: true, message: '', hint: ''}
            }
        }
        if (!row.string.length || /^;/.test(row.string)) {
            console.log('empty or comment row')
            // Empty or comment row
            return new RowCheck(null, null, null)
        }
        // Line with key and value e.g. not a comment or empty row:
        if (!row.string.includes('=')) {
            formatChecks = {
                string: row.string,
                checks: {
                    formatting: new CheckResult(false, 'line', 'Line formatting incorrect', 'Incorrectly formatted line, possibly missing a ";" character to mark the line as a comment.')
                }
            }
        } else {
            keyChecks = {
                string: row.key, // SCHLUESSEL
                checks: {
                    allUpper: KeyChecker.allUppercase(row.key),
                    validChars: KeyChecker.validCharacters(row.key)
                }
            };
            valueChecks = {
                string: row.value, // "Ich bin der Text = oder?"
                checks: {
                    encapsulated: ValueChecker.encapsulated(row.value),
                    lastCharNotEascaped: ValueChecker.lastCharIsNotEscaped(row.value),
                    doubleQuotesEscaped: ValueChecker.doubleQuotesEscaped(row.value)
                }
            }
        }
        return new RowCheck(formatChecks, keyChecks, valueChecks)
    }

    static getFails(rowChecks, rowNum) {
        let arrayOfErrors = []
        // Loop over Objects and build overal status
        for (const checkGroup of Object.values(rowChecks)) {
            if (checkGroup) {
                for (const check of Object.values(checkGroup.checks)) {
                    if (check && !check.status) {
                        arrayOfErrors.push({
                            rowNum: rowNum,
                            string: checkGroup.string,
                            check: check
                        })
                    }
                }
            }
        }
        return arrayOfErrors
    }
}

/**
 * Wrapper Class can be used to form the response if needed in the future
 */
class CheckResult {
    status;type;message;help;
    constructor(status, type, message, help) {
        this.status = status;
        this.type = type;
        this.message = message;
        this.help = help;
    }
}

export {Checker, KeyChecker, ValueChecker}

