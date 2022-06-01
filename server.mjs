import express from "express"
import fileUpload from "express-fileupload"
import fs from "fs"
import {v4 as uuidv4} from "uuid"
import cors from "cors"
import bodyParser from "body-parser";

// Own Modules
import {translate} from "./modules/translator.mjs";
import {Transport, ErrorResponse, UploadResponse, TranslateResponse} from "./modules/communication.mjs";
import {validFiletype} from "./modules/fileService.mjs";


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
 * Upload neue Files: Überprüft zuerst, ob Filetyp valide ist. Generiert eine uuid pro Filename für eine eindeutige Identifikation. Mit der uuid wird ein Unterordner im Uploadordner erstellt
 * und das File in den dazugehörigen Ordner verschoben.
 *
 * Upload bestehende Files: Wenn ein File hochgeladen wird, dass bereits existiert muss die existierende uuid im Requestbody als uuid mitgegeben werden.
 * So wird sichergestellt das kein neues File erstellt wird, sondern das bestehende aktualisiert wird.
 * @autor Claudia
 */


server.post('/upload', async (req, res) => {
    /*  1. File wird vom client hochgeladen,
        2. prüfen ob File hochgeladen wurde, false => res code 404 zurück "No File Uploaded"
        3. file Typ validieren, false => res code 400 zurück "Invalid Filetyp",
        4. uuId generieren, unterordner mit uuId im upload folder erstellen,
        (2. mal hochladen nach checker => uuid schon mitgeben, damit kann das file überschrieben werden und muss keine neue uuid generiert werden(so kann gleiche route benutzt werden) = > prüfen ob uuid valide ist,
        5. File in uuId folder verschieben,
        6. res 200 zurück an client mit uuId Objekt für identifizierung des files.
    */

    const existingUuid = req.body.uuid
    console.log(existingUuid)

    let uuid = ""
    let filename = ""
    let uploadFile = ""

    try {
        if (!req.files) {   // nötig hier zu checken ob im req.files auch ein uploadFile key vorhanden ist!
            res.status(404).send(new Transport('No file uploaded'));

            console.log("No file uploaded")
        } else if (!validFiletype(req.files.uploadFile.name)) {

            res.status(400).send(new Transport("Invalid filetype"))
            console.log("invalid filetype")

        } else if (existingUuid === undefined || existingUuid === "") {
            //Use the name of the input field (i.e. "uploadFile") to retrieve the uploaded file
            filename = req.files.uploadFile.name
            uploadFile = req.files.uploadFile
            uuid = uuidv4()

            try {
                await fs.mkdir('./upload/' + uuid, {recursive: true}, (err) => {
                    if (err) throw err;
                });
            } catch (err) {
                console.log(err)
            }
            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            await uploadFile.mv('./upload/' + uuid + '/' + filename);
            res.status(200).send(new UploadResponse("File created", uuid, filename))
        } else {

            let existingFileUpload = req.files.uploadFile
            let existingFilename = req.files.uploadFile.name

            console.log('./upload/' + existingUuid + '/' + existingFilename)
            fs.access('./upload/' + existingUuid + '/' + existingFilename, fs.F_OK, async (err) => {
                if (err) {
                    console.log(err)
                    res.status(404).send(new Transport('No File Found with this uuid'))

                } else {

                    console.log("existing File was found in " + './upload/' + existingUuid + '/' + existingFilename)

                    //Use the mv() method to place the file in upload directory (i.e. "uploads")
                    await existingFileUpload.mv('./upload/' + existingUuid + '/' + existingFilename)
                    res.status(200).send(new UploadResponse("existing File update successfully", existingUuid, existingFilename))
                }
            })
        }

    } catch (err) {
        console.log(err)
    }

})


//genau definieren wie Checker funktionieren soll
server.post('/checker', async (req, res) =>{
    /*  1. erhält von Client als req.param die uuId,
    *   2. sucht in upload/uuId nach File,
    *   3. liest file zeile für zeile ein,
    *   4. splittet zeile in Key Value pairs,
    *   5. checker überprüft key & value => (verbindung muss aktiv bleiben nach res!) false => res CheckerError Objekt an Client,
    *   //https://stackoverflow.com/questions/25209073/sending-multiple-responses-with-the-same-response-object-in-express-js
    *   6. checker abbruch nach zu vielen Errors (100) => res zu viele Errors (verbindung abbrechen),
    *   7. checker fertig ohne Fehler => res CheckerError Objekt mit 0 errors an client (verbindung abbrechen)  */
    if('uuid' in req.body && 'name' in req.body){
        const uuid = req.body.uuid
        const name = req.body.name
        console.log(uuid)
        console.log(name)
        res.send(new ErrorResponse("Checker Error", 2, "Syntaxerror", "The key has to be uppercase"))
    }else{
        res.status(400).send(new Transport("Invalid Request"))
    }

})
//genau definieren wie translater und file zusammenbau funktionieren soll
server.get('/translate', async (req, res) => {
    /*  1. erhält von Client als req.param die uuId, neuer filename,key, sourceLang, targetlang
        2. prüft ob uuid valide ist.
        3.prüfen ob dateiname gültig ist (leerschlag, sonderzeichen nicht erlaubt(string.replace(regex))
    *   4. sucht in upload/uuId nach File,
    *   5. liest file zeile für zeile ein,
    *   6. gibt response zurück mit zeilen die translated werden (für GUI aktualisation)
    *   7. splittet zeile in Key Value pairs,
    *   8. schickt value einzeln an deepl übersetzung,
    *   9. übersetzer string value zuweisen,
    *   10. file zusammensetzen
    *   11. file fertig zusammengesetzt => speichern in download/uuId/neuer Filename
    *   12. download sucht file in download/uuId/filename und downloaded es automatisch
    *   13. download erfolgreich => lösche file in download/uuId
    */
    try{
        let transValue = await translate("Hallo Welt", "6d7dc944-6931-db59-b9d3-e5d3a24e44b3:fx", "de", "ja")
        res.status(200).send(new TranslateResponse("Value successfully translated", transValue)
           )
    }catch (err){
        console.error(err)
    }

    /*
    const uuId = req.body.uuId
    console.log(uuId)
    res.send({message: 'translated the checked File and download it'})

     */
})



server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})