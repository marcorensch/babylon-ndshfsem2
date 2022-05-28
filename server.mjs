import express from "express"
import fileUpload from "express-fileupload"
import fs from "fs"
import {v4 as uuidv4} from "uuid"

// Own Modules
import {translate} from "./Modules/translator.mjs";
import {Response, ErrorResponse, UploadResponse, TranslateResponse} from "./Modules/communication.mjs";
import {validFiletyp} from "./Modules/fileService.mjs";

const server = express()
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
        (2. mal hochladen nach checker => uuid schon mitgeben, damit kann das file überschrieben werden und muss keine neue uuid generiert werden(so kann gleiche route benutzt werden)
        5. File in uuId folder verschieben,
        6. res 200 zurück an client mit uuId Objekt für identifizierung des files.
    */

    const existingUuid = req.body.uuid
    console.log(existingUuid)

    let uuid = ""
    let filename = ""
    let uploadFile = ""


    try {
        if (!req.files) {
            res.status(404).send(new Response('No file uploaded'));

            console.log("No file uploaded")
        } else if (!validFiletyp(req.files.uploadFile.name)) {

            res.status(400).send(new Response("Invalid filetyp"))
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
            res.status(200).send(new UploadResponse("existing File Upload successfully", uuid))
        } else {
            let existingFileUpload = req.files.uploadFile
            let existingFilename = req.files.uploadFile.name

            console.log('./upload/' + existingUuid + '/' + existingFilename)
            fs.access('./upload/' + existingUuid + '/' + existingFilename, fs.F_OK, async (err) => {
                if (err) {
                    console.log(err)
                    res.status(404).send(new Response('No File Found with this uuid'))

                } else {

                    console.log("existing File was found in " + './upload/' + existingUuid + '/' + existingFilename)

                    //Use the mv() method to place the file in upload directory (i.e. "uploads")
                    await existingFileUpload.mv('./upload/' + existingUuid + '/' + existingFilename)
                    res.status(200).send(new UploadResponse("existing File update successfully", existingUuid))
                }
            })
        }

    } catch (err) {
        console.log(err)
    }

})


//genau definieren wie Checker funktionieren soll
server.get('/checker', (req, res) =>{
    /*  1. erhält von Client als req.param die uuId,
    *   2. sucht in upload/uuId nach File,
    *   3. liest file zeile für zeile ein,
    *   4. splittet zeile in Key Value pairs,
    *   5. checker überprüft key & value => (verbindung muss aktiv bleiben nach res!) false => res CheckerError Objekt an Client,
    *   //https://stackoverflow.com/questions/25209073/sending-multiple-responses-with-the-same-response-object-in-express-js
    *   5. checker abbruch nach zu vielen Errors => res zu viele Errors (verbindung abbrechen),
    *   6. checker fertig ohne Fehler => res CheckerError Objekt mit 0 errors an client (verbindung abbrechen)  */
    const uuid = req.body.uuid
    console.log(uuid)
    res.send(new ErrorResponse("Checker Error", 2, "Syntaxerror", "The key has to be uppercase"))
})
//genau definieren wie translater und file zusammenbau funktionieren soll
server.get('/translate', async (req, res) => {
    /*  1. erhält von Client als req.param die uuId,
    *   2. sucht in upload/uuId nach File,
    *   3. liest file zeile für zeile ein,
    *   4. splittet zeile in Key Value pairs,
    *   5. schickt value einzeln an deepl übersetzung,
    *   6. übersetzer string value zuweisen,
    *   7. file zusammensetzen
    *   8. file fertig zusammengesetzt => speichern in download/uuId/filename
    *   9. download sucht file in download/uuId/filename und downloaded es automatisch
    *   10. download erfolgreich => lösche file in upload/uuId + in download/uuId  */
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