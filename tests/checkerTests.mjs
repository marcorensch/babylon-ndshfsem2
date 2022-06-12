import * as assert from 'assert';
import {KeyChecker, ValueChecker} from "../modules/Checker.mjs";

describe('testing Checker', () => {
    describe('Testing KeyChecker', function() {

        describe('Testing All Uppercase', function() {
            it('All uppercase check should return true if all chars are uppercase', function() {
                let t = KeyChecker.allUppercase("VALID")
                assert.equal(t.status, true); //true
            });
            it('All uppercase check should return false if at least one char is lowercase', function() {
                let t = KeyChecker.allUppercase("INVaLID")
                assert.equal(t.status, false); //false
            });
            it('All uppercase check should return false if multiple chars are lowercase', function() {
                let t = KeyChecker.allUppercase("inVaLiD")
                assert.equal(t.status, false); //false
            });
        });

        describe('Testing valid Characters', function() {
            /* ...Add tests  */
        });
    });
    describe('Testing ValueChecker', function() {
        describe('Testing encapsulated', function() {
            it('returns true because "String" is encapsulated', function() {
                let check = ValueChecker.encapsulated('"String"')
                assert.equal(check.status, true); //true
            });
            /* ...Add tests  */
        });
        describe('Testing lastCharIsNotEscaped', function() {
            /* ...Add tests  */
        });
        /* ...Add tests  */
    });
});
