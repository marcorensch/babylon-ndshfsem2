import {Row} from "./Row.mjs";

class KeyChecker{
    /* See https://regex101.com/ for testing regular expressions */

    /**
     * Checks if the given String is all uppercase
     * @param string
     * Related article: https://bobbyhadz.com/blog/javascript-check-if-string-is-all-uppercase
     */
    static allUppercase(string){
        let status = string.toUpperCase() === string && string !== string.toLowerCase()
        let msg = status ? '':"lowercase character(s) found"
        let hint = status ? '':`Key Values needs to be all in uppercase<br>Good: KEY_FOR_STRING<br>Bad: Key_for_String`
        return CheckResult.result(status, msg, hint)
    }

    /**
     * checks if the given string contains only characters (A-Z) and _
     * (https://regex101.com/r/ZksJD1/1)
     * @param string
     * Note: valide mit Small letters damit dieser Fehler hier nicht matched!
     */
    static validCharacters(string){
        let status = /^[_a-zA-Z]+$/.test(string)
        let msg = status ? '':"Invalid characters found"
        let hint = status ? '':'Key values may only contain the characters A-Z or _'
        return CheckResult.result(status,msg,hint)
    }
}

class ValueChecker{
    static encapsulated(string){
        string = string.trim()
        let status = string[string.length-1] === '"' && string[0] === '"'
        let msg = status ? '' : 'Value is not correctly encapsulated by "'
        let hint = status ? '' : `Value Strings needs to be encapsulated by double quotes ":<br>Good: "My value String"<br>Bad: My value String<br>Bad: 'My value String'`
        return CheckResult.result(status,msg,hint)
    }
    static lastCharIsNotEscaped(string){
        string = string.trim()
        let status = !/\\"$/.test(string)
        let msg = status ? '' : 'Last sign in String is a \\'
        let hint = status ? '' : 'no backslash may be used in the last position of the string'
        return CheckResult.result(status,msg,hint)
    }

    static doubleQuotesEscaped(string) {
        string = string.trim()
        let status = !/(?<!\\)"/.test(string.slice(1, -1));
        let msg = status ? '':'Unescaped Double Quotes found'
        let hint = status ? '':`Double quotes in value strings must be escaped by backslashs<br>Good:<div class=\\"foo\\">foo</div><br>Bad: <div class="foo">foo</div>`
        return CheckResult.result(status,msg,hint)
    }
}

class RowHelper{
    static overallStatus(rowChecks){
        rowChecks.overallStatus = false
        return rowChecks
    }
}

class RowCheck{
    valueChecks;keyChecks;generalChecks;

    constructor(generalChecks, keyChecks, valueChecks) {
        this.generalChecks = generalChecks;
        this.valueChecks = valueChecks;
        this.keyChecks = keyChecks;
    }
}



class Checker{
    /**
     *
     * @param rows  Array of Strings
     * @return  Array of { Row, RowChecks }
     */
    static checkRows(rows){
        // Checker Result only contains ROW items of rows with errors
        let checkerResults = []
        let rowNum = 1
        for (const rowString of rows) {
            let isValid = true
            let rowObj = new Row(rowNum, rowString)
            rowObj.checks = {status:false}
            rowObj.checks = this.checkRow(rowObj)
                // Push if error
            // checkTypeLoop: for (const checkType of Object.entries(rowObj.checks)) {
            //     console.log(checkType)
            //     checkLoop: for (const check of Object.entries(checkType.value)) {
            //         if(check.status){
            //             isValid = false
            //             break checkTypeLoop;
            //         }
            //     }
            // }
            checkerResults.push(rowObj)
            rowNum++
        }
        return checkerResults
    }
    /**
     * @param   row     Row Object
     */
    static checkRow(row) {
        console.log(row)
        let keyChecks,valueChecks, rowChecks
        let generalStatus = { status : true, message: ''}
        if(!row.string.length || row.string.startsWith(";") ) {
            // Empty or comment row
            return new RowCheck(null, null, null)
        }
        if(!row.string.includes('=')){
            rowChecks = {
                string: row.string,
                status: false,
                message: 'Line formatting incorrect',
                hint: 'Incorrectly formatted line, possibly missing a ";" character to mark the line as a comment',
            }
        }else{
            keyChecks = {
                string: row.key, // SCHLUESSEL
                checks: {
                    allUpper: KeyChecker.allUppercase(row.key),
                    validChars: KeyChecker.validCharacters(row.key)
                }
            };
            valueChecks = {
                string: row.value_orig, // "Ich bin der Text = oder?"
                checks: {
                    encapsulated: ValueChecker.encapsulated(row.value_orig),
                    lastCharNotEascaped: ValueChecker.lastCharIsNotEscaped(row.value_orig),
                    doubleQuotesEscaped: ValueChecker.doubleQuotesEscaped(row.value_orig)
                }
            }


        }
        return new RowCheck(rowChecks, keyChecks, valueChecks)
    }
}

class Helper{
    /**
     * splits the row into key & value
     * @param row String: 'FOO="bar"'
     * @returns array [key, value]
     * Source: https://stackoverflow.com/a/64350461/4708062
     */
    static splitRow(row){
        // SCHLUESSEL="Ich bin der Value = oder?"
        const [key, ...rest] = row.split('=')
        // key = "SCHLUESSEL"
        // rest = ["Ich bin der Value ", " oder?" ]
        const value = rest.join('=')
        // value => "Ich bin der Value = oder?"
        return [key, value] // SCHLUESSEL, "Ich bin der Value = oder?"
    }
}

/**
 * Wrapper Class can be used to form the response if needed in the future
 */
class CheckResult{
    static result(status, message, help){
        return {status, message, help}
    }
}

export {Checker, KeyChecker, ValueChecker}

