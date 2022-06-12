import express from "express"
import { createServer } from 'http'
import { Server } from 'socket.io';
import fileUpload from "express-fileupload"
import fs from "fs"
import {v4 as uuidv4} from "uuid"
import cors from "cors"
import bodyParser from "body-parser";



// Own Modules
import Translator from "./modules/translator.mjs";
import {ErrorResponse, TranslateResponse, Transport, UploadResponse} from "./modules/communication.mjs";
import {
    deleteFileAndFolder,
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
        origin: "http://localhost:8081"
    }});
server.use(cors())
const port = 3000

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
 * Info: Added Middleware für Express-Server
 * @autor: Marco
 */

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

/**
 * Upload neue Files: Überprüft zuerst, ob Filetype valide ist. Generiert eine uuid pro Filename für eine eindeutige Identifikation. Mit der uuid wird ein Unterordner im Uploadordner erstellt
 * und das File in den dazugehörigen Ordner verschoben.
 *
 * Upload bestehende Files: Wenn ein File hochgeladen wird, dass bereits existiert muss die existierende uuid im Requestbody als uuid mitgegeben werden.
 * So wird sichergestellt das kein neues File erstellt wird, sondern das bestehende aktualisiert wird.
 * @autor Claudia
 */


server.post('/upload', async (req, res) => {
    const existingUuid = req.body.uuid
    console.log(existingUuid)
    let uuid = ""
    let filename = ""
    let uploadFile = ""

    try {
        if (!req.files) {
            res.status(404).send(new Transport('No file uploaded'));
            console.log("No file uploaded")
        } else if (!validFiletype(cleanFilename(req.files.uploadFile.name))) {

            res.status(400).send(new Transport("Invalid filetype, please try again using a supported file extensions.", false))
            console.log("Invalid filetype")

        } else if (existingUuid === undefined || existingUuid === "") {
            //Use the name of the input field (i.e. "uploadFile") to retrieve the uploaded file
            filename = cleanFilename(req.files.uploadFile.name)
            uploadFile = req.files.uploadFile

            uuid = uuidv4()
            await moveFile(uuid, filename, uploadFile)

            res.status(200).send(new UploadResponse("New File Upload successfully", uuid, filename))
        } else {
            let existingFileUpload = req.files.uploadFile
            let existingFilename = cleanFilename(req.files.uploadFile.name)

            if (validUuid(existingUuid)) {
                if (fs.existsSync('./upload/' + existingUuid)) {
                    console.log("path exist")
                    fs.readdir('./upload/' + existingUuid, async (err, files) => {
                        if (err) {
                            console.log(err)
                        } else if (files.includes(existingFilename)) {
                            console.log("File mit gleichem uuid und filename hochgeladen")
                            console.log("existing File was found in " + './upload/' + existingUuid + '/' + existingFilename)

                            //Use the mv() method to place the file in upload directory (i.e. "uploads")
                            await existingFileUpload.mv('./upload/' + existingUuid + '/' + existingFilename)
                            res.status(200).send(new UploadResponse("existing File update successfully", existingUuid))

                        } else {
                            //lösche alte uuid Ordner + file
                            await deleteFileAndFolder('./upload/' + existingUuid, existingUuid)
                            // erstelle neue uuid ordner + File
                            uuid = uuidv4()
                            await moveFile(uuid, existingFilename, existingFileUpload)

                            res.status(200).send(new UploadResponse("Filename changed => new Upload File successfully", uuid))
                        }
                    })
                } else {
                    console.log("Falsche uuid")
                    res.status(500).send(new Transport('File could not be handled, please Refresh page and try again', false))
                }

            } else {
                res.status(500).send(new Transport('Token invalid, please refresh the page and try again', false))
            }
        }
    } catch (err) {
        console.error(err)
        res.status(500).send(new Transport('Something went wrong while uploading your file', false))
    }
})

//genau definieren wie Checker funktionieren soll
server.get('/checker', async (req, res) => {
    /*  1. erhält von Client als req.param die uuId,
    *   2. sucht in upload/uuId nach File,
    *   3. liest file zeile für zeile ein,
    *   4. splittet zeile in Key Value pairs,
    *   5. checker überprüft key & value => (verbindung muss aktiv bleiben nach res!) false => res CheckerError Objekt an Client,
    *   //https://stackoverflow.com/questions/25209073/sending-multiple-responses-with-the-same-response-object-in-express-js
    *   6. checker abbruch nach zu vielen Errors (100) => res zu viele Errors (verbindung abbrechen),
    *   7. checker fertig ohne Fehler => res CheckerError Objekt mit 0 errors an client (verbindung abbrechen)  */
    console.log(req.headers)
    const neededHeaders = [ 'uuid','name']
    if(!neededHeaders.every(key => Object.keys(req.headers).includes(key))){
        res.status(400).send(new Transport('Missing headers', false))
    }
    const uuid = req.headers.uuid
    const name = req.headers.name
    const uploadFilePath = uploadPath(uuid,name)
    if(!validUuid(uuid)){
        res.status(400).send(new Transport('Invalid uuid', false))
    }
    if(!fs.existsSync(uploadFilePath)){
        res.status(404).end('File does not exist on server side')
    }
    // Check Array of Rows (Array of String)
    const container = Checker.checkRows(readRows(uploadFilePath))

    res.status(200).send(container)

})
/**
 *
 * @autor Claudia, Marco
 */
server.get('/translator', async (req, res) => {
    const neededHeaders = ['authorization', 'srclng', 'trglng', 'saveas', 'uuid','name']
    if(!neededHeaders.every(key => Object.keys(req.headers).includes(key))){
        res.status(400).send(new Transport('Missing headers', false))
    }
    const data = {}
    for (const key of neededHeaders) { data[key] = req.headers[key]}

    if(!validUuid(data.uuid)){
        res.status(400).send(new Transport('Invalid uuid', false))
    }
    if(!fs.existsSync(uploadPath(data.uuid,data.name))){
        res.status(404).end('Uploaded File does not exist on server side')
    }

    data.srclng = data.srclng === 'auto' ? null : data.srclng;
    // ToDo: Save as check! (muss dateiname mit suffix sein)
    data.saveas = data.saveas || '';

    try{
        let rows = readRows(uploadPath(data.uuid,data.name))
        let translatedData = await Translator.translation(prepareRowData(rows), data.authorization, data.srclng, data.trglng, io)

        let filename = data.saveas === "" ? data.name : cleanFilename(data.saveas)

        let filePath = data.uuid + '/' + filename;
        let downloadUrl = downloadHttp(data.uuid, filename)

        createEmptyDownloadFolderAndFileSync(data.uuid, filename)
        writeToFile(prepareDataForNewFile(translatedData), `./download/${filePath}`)
        io.emit('file-created', {url: downloadUrl}) // <== Workaround for large files (res.send next row not fired on file with 900+ rows - may already disconnected?)
        res.status(200).send(JSON.stringify(new TranslateResponse("File successfully translated => ready for download", downloadUrl)))

    }catch(err){
        console.error(err.toString())
        res.status(500).end(err.toString())
    }
})


/**
 * @description Get Route für den Download der erstellten Datei
 * @autor Marco
 */
server.get('/download/:uuid/:filename', async (req, res) => {
    let uuid = req.params.uuid
    let filename = req.params.filename
    let path = './download/' + uuid + '/' + filename

    if (validUuid(uuid) && fs.existsSync(path)) {
        res.download(path)
    } else {
        res.status(404).send(new Transport('Invalid uuid OR Filename'))
    }
})

/**
 * @description Get Route die für den client um bei Deepl die usage statistics abzuholen
 * @autor Claudia, Marco
 */
server.get('/usage', async (req, res) => {
    if('authorization' in req.headers){
        let authKey = req.headers.authorization
        let usage = await Translator.getUsage(authKey)
        res.status(200).send(JSON.stringify(usage))
    }else {
        res.status(401).send(new Transport("No authorization key"))
    }
})

/**
 * @description Get Route die für den client um bei Deepl die verfügbaren Sprachen für srouce & target abzuholen
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
 * @description Simple Get Route um zu prüfen ob der Server (Backend) verfügbar ist
 * @autor Marco
 */
server.get('/status', (req, res) => {
    res.set('Content-Type','application/json')
    res.status(200).send({})
})

