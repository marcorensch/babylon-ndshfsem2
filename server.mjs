import express from "express"
import { createServer } from 'http'
import { Server } from 'socket.io';
import fileUpload from "express-fileupload"
import {Walle} from "./modules/Walle.mjs";
import fs from "fs"
import {v4 as uuidv4} from "uuid"
import cors from "cors"
import bodyParser from "body-parser";

// Own Modules
import Translator from "./modules/translator.mjs";
import {TranslateResponse, Transport, UploadResponse} from "./modules/communication.mjs";
import {
    moveFile,
    readRows,
    validFiletype,
    cleanFilename,
    createEmptyDownloadFolderAndFileSync,
    writeToFile, prepareDataForNewFile, prepareRowData, uploadPath, downloadPath, downloadHttp
} from "./modules/fileService.mjs";
import {validUuid} from "./modules/Helpers.mjs";
import {Checker} from "./modules/Checker.mjs";

const server = express()
const httpServer = createServer(server)
const io = new Server(httpServer,{
    cors: {
        origin: "http://localhost:8080"
    }});
server.use(cors())
const port = 3000
const wall_eTimer = 14400000; // 4 hours

httpServer.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})

/**
 * Info: Middleware für Express-Server
 * express.json() parse json
 * fileUpload() supportet upload via Inputfield
 * @autor: Claudia
 */
server.use(express.json())
server.use(fileUpload(
    {
        createParentPath: true
    }))

/**
 * Info: Added Middleware for Express-Server
 * @autor: Marco
 */
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

/**
 * Speichert neue Dateien: Prüft zuerst, ob der Dateityp gültig ist.
 * Erzeugt eine uuid pro Dateiname zur eindeutigen Identifizierung.
 * Die uuid wird zur Erstellung eines Unterordners im Upload-Ordner
 * und zum Verschieben der Datei in den entsprechenden Ordner verwendet.
 *
 * @param req{Object}
 * @autor Claudia
 */
server.post('/upload', async (req, res) => {
    const existingUuid = req.body.uuid
    console.log(existingUuid)
    let uuid = ""
    let filename = ""
    let uploadFile = ""

    // Wall-E cleans all Files in Upload and Download folders older than n
    Walle.garbageService(wall_eTimer)
    try {
        if (!req.files) {
            res.status(404).send(new Transport('No file uploaded'));
        } else if (!validFiletype(cleanFilename(req.files.uploadFile.name))) {
            res.status(400).send(new Transport("Invalid filetype, please try again using a supported file extensions.", false))
        } else if (existingUuid === undefined || existingUuid === "") {
            //Use the name of the input field (i.e. "uploadFile") to retrieve the uploaded file
            filename = cleanFilename(req.files.uploadFile.name)
            uploadFile = req.files.uploadFile
            uuid = uuidv4()
            await moveFile(uuid, filename, uploadFile)
            res.status(200).send(new UploadResponse("New File Upload successfully", uuid, filename))
        } else {
            // This Block is currently not in use - it is used to update existing files in a future version
            // not yet implemented
            /*
            let existingFileUpload = req.files.uploadFile
            let existingFilename = cleanFilename(req.files.uploadFile.name)
            if (validUuid(existingUuid)) {
                if (fs.existsSync('./upload/' + existingUuid)) {
                    // path exists
                    fs.readdir('./upload/' + existingUuid, async (err, files) => {
                        if (err) {
                            console.error(err)
                        } else if (files.includes(existingFilename)) {
                            await existingFileUpload.mv('./upload/' + existingUuid + '/' + existingFilename)
                            res.status(200).send(new UploadResponse("existing File update successfully", existingUuid))
                        } else {
                            // delete old UUID & File
                            await deleteFileAndFolder('./upload/' + existingUuid)
                            // erstelle neue uuid ordner + File
                            uuid = uuidv4()
                            await moveFile(uuid, existingFilename, existingFileUpload)
                            res.status(200).send(new UploadResponse("Filename changed => new Upload File successfully", uuid, existingFilename))
                        }
                    })
                } else {
                    // Wrong UUID
                    res.status(500).send(new Transport('File could not be handled, please Refresh page and try again', false))
                }
            } else {
                res.status(500).send(new Transport('Token invalid, please refresh the page and try again', false))
            }
             */
        }
    } catch (err) {
        console.error(err)
        res.status(500).send(new Transport('Something went wrong while uploading your file', false))
    }
})
/**
 * Einstiegspunkt Checker Service
 *
 * @param req{Object}
 * @autor Marco
 */
server.get('/checker', async (req, res) => {
    const neededHeaders = [ 'uuid','name']
    if(!neededHeaders.every(key => Object.keys(req.headers).includes(key))){
        res.status(400).send(new Transport('Missing information in request', false))
        return
    }
    const uuid = req.headers.uuid
    const name = req.headers.name
    const uploadFilePath = uploadPath(uuid,name)
    if(!validUuid(uuid)){
        res.status(400).send(new Transport('Invalid ID', false))
        return
    }
    if(!fs.existsSync(uploadFilePath)){
        res.status(404).send(new Transport('File does not exist in backend - Please try again', false))
        return
    }
    // Check Array of Rows (Array of String)
    const container = Checker.checkRows(readRows(uploadFilePath))

    res.status(200).send(container)
})
/**
 * Einstiegspunkt für den Übersetzerdienst
 *
 * @param req{Object}
 * @autor Claudia, Marco
 */
server.get('/translator', async (req, res) => {
    const neededHeaders = ['authorization', 'srclng', 'trglng', 'saveas', 'uuid','name']
    const data = {}

    if(!neededHeaders.every(key => Object.keys(req.headers).includes(key))){
        res.status(400).send(new Transport('Invalid Request, Please try again', false))
        return
    }

    for (const key of neededHeaders) { data[key] = req.headers[key]}

    if(!/[a-z\d_\-]+\.(ini|txt)$/i.test(data.saveas)){
        res.status(400).send(new Transport('Invalid "Save as" Filename', false))
        return
    }
    if(!validUuid(data.uuid)){
        res.status(400).send(new Transport('Invalid UUID, Please Upload File again', false))
        return
    }
    if(!fs.existsSync(uploadPath(data.uuid,data.name))){
        res.status(404).send(new Transport('Uploaded File could not be saved, Please Upload File again', false))
        return
    }

    data.srclng = (data.srclng === 'auto') ? null : data.srclng;

    try{
        let rows = readRows(uploadPath(data.uuid,data.name))
        let translatedData = await Translator.translation(prepareRowData(rows), data.authorization, data.srclng, data.trglng, io)

        let filename = data.saveas === "" ? data.name : cleanFilename(data.saveas)
        if (validFiletype(filename)){
            let filePath = data.uuid + '/' + filename;
            let downloadUrl = downloadHttp(data.uuid, filename)

            createEmptyDownloadFolderAndFileSync(data.uuid, filename)
            writeToFile(prepareDataForNewFile(translatedData), `./download/${filePath}`)
            // Comm back to client via socket and send - robustness to make sure client got it
            io.emit('file-created', {url: downloadUrl})
            res.status(200).send(new TranslateResponse("File successfully translated => ready for download", downloadUrl))
        }else {
            res.status(400).send(new Transport("Invalid filetype, please try again using a supported file extensions.", false))
        }
    }catch(err){
        console.error(err.toString())
        res.status(500).send(new Transport('Something went wrong while translating your file', false))
    }
})


/**
 * Dynamische Get-Route für den Download der erstellten Datei
 *
 * @autor Marco
 */
server.get('/download/:uuid/:filename', async (req, res) => {
    let uuid = req.params.uuid
    let filename = req.params.filename
    let dlpath = downloadPath(uuid,filename)

    if (validUuid(uuid) && fs.existsSync(dlpath)) {
        res.download(dlpath)
    } else {
        res.status(404).send(new Transport('Invalid ID or Filename - Please try again', false))
    }
})

/**
 * Get Route die für den client um bei DeepL die usage statistics abzuholen
 *
 * @autor Claudia, Marco
 */
server.get('/usage', async (req, res) => {
    if('authorization' in req.headers){
        let authKey = req.headers.authorization
        let usage = await Translator.getUsage(authKey)
        res.status(200).send(JSON.stringify(usage))
    }else {
        res.status(401).send(new Transport("No authorization key",false))
    }
})

/**
 * Route um verfügbare DeepL-Sprachen abrufen
 *
 * @autor Claudia, Marco
 */
server.get('/languages', async (req, res) => {
    if('authorization' in req.headers){
        let authKey = req.headers.authorization
        let languages = await Translator.getLanguages(authKey)
        res.status(200).send(languages)
    }else{
        res.status(401).send(new Transport("No API key given"))
    }
})

/**
 * Einfache Get-Route zur Überprüfung, ob das Backend erreichbar ist
 *
 * @autor Marco
 */
server.get('/status', (req, res) => {
    res.set('Content-Type','application/json')
    res.status(200).send({})
})

