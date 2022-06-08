import * as assert from 'assert';
import express from 'express';
import {validFiletype} from "../modules/fileService.mjs";







describe('CheckIfFilenameIsValid', function() {
    describe('with pdf filenames', function() {//szenario
        it('should return false, myFile.pdf is not allowed', function() {
            assert.equal(validFiletype("myFile.pdf"), false); //HELLO
        });
    });
    describe('with ini- filenames', function() {//szenario
        it('should return true, myFile.ini is allowed', function() {
            assert.equal(validFiletype("myFile.ini"), true); //HELLO
        });
    });
    describe('with txt- filenames', function() {//szenario
        it('should return true, myFile.txt is allowed', function() {
            assert.equal(validFiletype("myFile.txt"), true); //HELLO
        });
    });
    describe('without fileextension', function() {//szenario
        it('should return false, myFile is not allowed', function() {
            assert.equal(validFiletype("myFile"), false); //HELLO
        });
    });
    describe('with double fileextension', function() {//szenario
        it('should return false, myFile.txt.pdf is not allowed', function() {
            assert.equal(validFiletype("myFile.txt.pdf"), false); //HELLO
        });
    });
});