import express from "express"
import fileUpload from "express-fileupload"
import fs from "fs"
import {v4 as uuidv4} from "uuid"
import cors from "cors"
import bodyParser from "body-parser";

// Own Modules
import {translation, getUsage, getLanguages} from "./modules/translator.mjs";
import {ErrorResponse, TranslateResponse, Transport, UploadResponse} from "./modules/communication.mjs";
import {
    deleteFileAndFolder,
    moveFile,
    readRows,
    validFiletype,
    cleanFilename,
    validUuid,
    createEmptyDownloadFolderAndFile,
    writeToFile, prepareDataForNewFile, prepareRowData
} from "./modules/fileService.mjs";



const server = express()
server.use(cors())
const port = 3000

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
server.post('/checker', async (req, res) => {
    /*  1. erhält von Client als req.param die uuId,
    *   2. sucht in upload/uuId nach File,
    *   3. liest file zeile für zeile ein,
    *   4. splittet zeile in Key Value pairs,
    *   5. checker überprüft key & value => (verbindung muss aktiv bleiben nach res!) false => res CheckerError Objekt an Client,
    *   //https://stackoverflow.com/questions/25209073/sending-multiple-responses-with-the-same-response-object-in-express-js
    *   6. checker abbruch nach zu vielen Errors (100) => res zu viele Errors (verbindung abbrechen),
    *   7. checker fertig ohne Fehler => res CheckerError Objekt mit 0 errors an client (verbindung abbrechen)  */
    if ('uuid' in req.body && 'name' in req.body) {
        const uuid = req.body.uuid
        const name = req.body.name
        console.log(uuid)
        console.log(name)
        res.send(new ErrorResponse("Checker Error", 2, "Syntaxerror", "The key has to be uppercase"))
    } else {
        res.status(400).send(new Transport("Invalid Request"))
    }

})
/**
 * Translator braucht folgende Angaben im Request Body: uuid, filename, Quellsprache, Zielsprache, Api-Key, gewünschter Filename für den Download.
 * Zuerst wir überprüft, ob die uuid und der Pfad gültig sind. Danach wird das Hochgeladene File ausgelesen und prepariert, so dass die Values zur Übersetzung übergeben werden können.
 * Nun werden die Values mittels Deepl-API übersetzt und das File wird mit den übersetzten Values zusammengesetzt und im Download Ordner bereitgestellt für den Download.
 * @autor Claudia
 */
server.post('/translator', async (req, res) => {
    if ('uuid' in req.body && 'name' in req.body && 'srcLng' in req.body && 'trgLng' in req.body && 'authKey' in req.body) {
        const data = req.body;
        data.saveAs = data.saveAs || '';

        // {
        //     uuid: req.body.uuid,
        //     name: req.body.name,
        //     srcLng: req.body.srcLng,
        //     trgLng: req.body.trgLng,
        //     authKey: req.body.authKey,
        //     saveAs: req.body.saveAs ? req.body.saveAs : '' // saveAs mit typ endung!! wegen funktion cleanFilename()
        // }

        let path = './upload/' + data.uuid + '/' + data.name

        if (validUuid(data.uuid) && fs.existsSync(path)){
            try{
                let rows = readRows(path)
                let preparedDataForTranslation = prepareRowData(rows)
                let translatedData = await translation(preparedDataForTranslation, data.authKey, data.srcLng, data.trgLng)
                let preparedDataForNewFile = prepareDataForNewFile(translatedData)

                let filename = data.saveAs === "" ? data.name : cleanFilename(data.saveAs)

                await createEmptyDownloadFolderAndFile(data.uuid, filename)
                await writeToFile(preparedDataForNewFile, './download/' + data.uuid + '/' + filename)

                res.status(200).send(new TranslateResponse("File successfully translated => ready for download", 'http://localhost:3000/download/' + data.uuid + '/' + filename))
            }catch(err){
                console.error(err.toString())
                res.status(500).send(new TranslateResponse(err.toString()))
            }

        }else {
            res.status(404).send(new Transport('Invalid uuid OR Filename'))
        }

    } else {
        res.status(408).send(new Transport("Invalid Request"))
    }
})

server.get('/usage', async (req, res) => {
    if('authorization' in req.headers){
        let authKey = req.headers.authorization
        let usage = await getUsage(authKey)
        res.status(200).send(JSON.stringify(usage))
    }else {
        res.status(401).send(new Transport("No authorization key"))
    }
})

server.get('/languages', async (req, res) => {
    if('authorization' in req.headers){
        let authKey = req.headers.authorization
        let languages = await getLanguages(authKey)
        res.status(200).send(languages)
    }else{
        res.status(401).send(new Transport("No authorization key"))
    }
})


server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})