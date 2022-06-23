import * as assert from 'assert';

import {validFiletype} from "../modules/fileService.mjs";
import {cleanFilename} from "../modules/fileService.mjs";

import {KeyChecker, ValueChecker} from "../modules/Checker.mjs";


describe('Testing Checker', function() {
    describe('testing KeyChecker', function() {
        describe('testing All UpperCase', function () {
            it('All uppercase check should return true, if all chars are uppercase', function () {
                let t = KeyChecker.allUppercase("ID")
                assert.equal(t.status, true);
            });
            it('All uppercase check should return false, if at least one char is lowercase', function () {
                let t = KeyChecker.allUppercase("Id")
                assert.equal(t.status, false);
            });
            it('All uppercase check should return false, if multiple chars are lowercase', function () {
                let t = KeyChecker.allUppercase("IdId")
                assert.equal(t.status, false);
            });
        });

        describe('testing Valid Characters', function () {
            it('Valid Characters check should return true, if it is a letter or a underscore', function () {
                let t = KeyChecker.validCharacters("Id")
                assert.equal(t.status, true);
            });
            it('Valid Characters check should return true, if it a underscore', function () {
                let t = KeyChecker.validCharacters("_ID")
                assert.equal(t.status, true);
            });
            it('Valid Characters check should return false, if it is not a letter or not a underscore', function () {
                let t = KeyChecker.validCharacters("Id:3")
                assert.equal(t.status, false);
            });
        });
    });
    describe('testing ValueChecker', function() {
        describe('testing encapsulated', function () {
            it('Encapsulated check should return true, because "String" is encapsulatet', function () {
                let test = ValueChecker.encapsulated('"Value"')
                assert.equal(test.status, true);
            });
            it('Encapsulated check should return false, because "String is not correctly encapsulatet', function () {
                let test = ValueChecker.encapsulated('"Value')
                assert.equal(test.status, false);
            });
            it('Encapsulated check should return false, because String" is not correctly encapsulatet', function () {
                let test = ValueChecker.encapsulated('Value"')
                assert.equal(test.status, false);
            });
            it('Encapsulated check should return false, because String is not encapsulatet', function () {
                let test = ValueChecker.encapsulated('Value')
                assert.equal(test.status, false);
            });
        });

        describe('testing lastCharIsNotEscaped', function () {
            it('lastCharIsNotEscaped check should return true, if it has no backslash in the last position', function () {
                let test = ValueChecker.lastCharIsNotEscaped('Value')
                assert.equal(test.status, true);
            });

            it('lastCharIsNotEscaped check should return true, if it has a backslash, but not in the last position', function () {
                let test = ValueChecker.lastCharIsNotEscaped('Valu\\e')
                assert.equal(test.status, true);
            });
        });

        describe('testing doubleQuotesEscaped', function () {
            it('doubleQuotesEscaped check should return true, if it has double Quotation Marks on both site', function () {
                let test = ValueChecker.doubleQuotesEscaped('\"Value\"')
                assert.equal(test.status, true);
            });

            it('doubleQuotesEscaped check should return false, if double quotes not escaped', function () {
                let test = ValueChecker.doubleQuotesEscaped('<div class="foo">text</div>')
                assert.equal(test.status, false);
            });

        });
    });
});

describe('Testing cleanFilename checks', function() {
    it('Replace white space in the name with dash', function() {
        assert.equal(cleanFilename("hans hut.txt"), "hans-hut.txt");
    });

    it('Strip any special characters, underscore allowed', function() {
        assert.equal(cleanFilename("ha/ns_hut.txt"), "hans_hut.txt");
    });

    it('split only the last dot', function() {
        assert.equal(cleanFilename("hans.hut.tut.txt"), "hanshuttut.txt");
    });
});

describe('Testing Filename validity checks', function() {
    describe('with pdf filenames', function() {
        it('should return false, myFile.pdf is not allowed', function() {
            assert.equal(validFiletype("myFile.pdf"), false);
        });
    });
    describe('with ini-filename', function() {
        it('should return true, myFile.ini is allowed', function() {
            assert.equal(validFiletype("myFile.ini"), true);
        });
    });
    describe('with txt-filename', function() {
        it('should return true, myFile.txt is allowed', function() {
            assert.equal(validFiletype("myFile.txt"), true);
        });
    });
    describe('without file extension', function() {
        it('should return false, myFile is not allowed', function() {
            assert.equal(validFiletype("myFile"), false);
        });
    });
    describe('with double file extension', function() {
        it('should return false, myFile.txt.pdf is not allowed', function() {
            assert.equal(validFiletype("myFile.txt.pdf"), false);
        });
    });
});

