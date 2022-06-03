import express from "express"
import fileUpload from "express-fileupload"
import fs from "fs"
import {v4 as uuidv4} from "uuid"
import cors from "cors"
import bodyParser from "body-parser";

// Own Modules
import {translate} from "./modules/translator.mjs";
import {ErrorResponse, Transport, UploadResponse} from "./modules/communication.mjs";
import {deleteFileAndFolder, moveFile, readRows, Row, validFiletype, validUuid} from "./modules/fileService.mjs";


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
        (2. mal hochladen nach checker => uuid schon mitgeben,
        damit kann das file überschrieben werden und muss keine neue uuid generiert werden(so kann gleiche route benutzt werden) => prüfen ob uuid valide ist,
        Möglichkeit geschaffen das Filename geändert werden kann => neue uuid generieren und alte uuid + File löschen
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
                res.status(404).send(new Transport('No file uploaded'));

                console.log("No file uploaded")
            } else if (!validFiletype(req.files.uploadFile.name)) {

                res.status(400).send(new Transport("Invalid filetyp"))
                console.log("invalid filetype")

            } else if (existingUuid === undefined || existingUuid === "") {
                //Use the name of the input field (i.e. "uploadFile") to retrieve the uploaded file
                filename = req.files.uploadFile.name
                uploadFile = req.files.uploadFile

                console.log(typeof (req.files.uploadFile))

                uuid = uuidv4()
                await moveFile(uuid, filename, uploadFile)

                res.status(200).send(new UploadResponse("New File Upload successfully", uuid))
            } else {
                let existingFileUpload = req.files.uploadFile
                let existingFilename = req.files.uploadFile.name

                if (validUuid(existingUuid)){
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
                        res.status(404).send(new Transport('No File Found with this uuid'))
                    }

                }else {
                    res.status(404).send(new Transport('Invalid uuid'))
                }


            }
        } catch (err) {
            console.error(err)
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
//genau definieren wie translater und file zusammenbau funktionieren soll
server.post('/translator', async (req, res) => {
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
    console.log(req.body)
    if ('uuid' in req.body && 'name' in req.body && 'srcLng' in req.body && 'trgLng' in req.body && 'authKey' in req.body) {
        const data = {
            uuid: req.body.uuid,
            name: req.body.name,
            srcLng: req.body.srcLng,
            trgLng: req.body.trgLng,
            authKey: req.body.authKey,
            saveAs: req.body.saveAs ? req.body.saveAs : ''
        }
        console.log(data.uuid)
        console.log(data.name)

        let path = './upload/' + data.uuid + '/' + data.name

        let rows = readRows(path)


        let mapped = rows.map((row, index) =>{
            if (row.length === 0 || row.startsWith(";")){
                return row
            }else if (row.includes("=")){

                const [key, ...rest] = row.split('=')

                const value = rest.join('=')
                // value => "Ich bin der Value = oder?"

               let keyValuePair = [key, value] // good, luck_buddy
                let k = keyValuePair[0]
                let v = keyValuePair[1]

                return new Row(index+ 1, k, v)

            }
        })



        async function translation(mapped) {
            for (const row of mapped) {
                console.log(row.value_orig)
                if (row === "" || row[0] === ";" || row.value_orig ===  "") {
                    console.log("Zeile ohne value: " + row)
                } else {

                    try {
                        row.value_translated = await translate(row.value_orig, data.authKey, data.srcLng, data.trgLng)
                        console.log(row.value_translated)
                        //res.status(200).send(new TranslateResponse("Value successfully translated", transValue)

                    } catch (err) {
                        console.error(err)
                        // res.status(500).send(new ErrorResponse("Translator Error", 2, "Whoopsie", "oopsie"))
                    }
                }
            }
            return mapped
        }


        let translatedValues = await translation(mapped)
       // console.log(translatedValues)

        async function createEmptyDownloadFile( uuid, filename) {
            try {
                await fs.mkdir('./download/' + uuid, {recursive: true}, (err) => {
                    if (err) throw err;
                });
                fs.writeFile('./download/' + uuid + '/' + filename, "", (err) =>{
                    if (err){
                        console.error(err)
                    }
                    console.log("File is created successfully")
                })
            } catch (err) {
                console.log(err)
            }
        }



        let preparedDataForNewFile = translatedValues.map((value, index) => {
            if (value.length === 0 || value[0] === ";") {
                return value
            }else {
                return value.key.concat("=" + value.value_translated)
            }
        })

        console.log(preparedDataForNewFile)



         function writeToFile(data, path) {


            for (const row of data) {
                 fs.appendFileSync(path, row + "\n", err => {
                    if (err) {
                        console.error(err)
                    }
                    console.log("File is updated")
                })
            }


        }
        await createEmptyDownloadFile(data.uuid, data.saveAs)
        writeToFile(preparedDataForNewFile, './download/' + data.uuid + '/' + data.saveAs)

        /*

        try {
            let transValue = await translate("Hallo Welt", "6d7dc944-6931-db59-b9d3-e5d3a24e44b3:fx", "de", "ja")
            res.status(200).send(new TranslateResponse("Value successfully translated", transValue)
            )
        } catch (err) {
            console.error(err)
            res.status(500).send(new ErrorResponse("Translator Error", 2, "Whoopsie", "oopsie"))
        }


         */

    } else {
        res.status(408).send(new Transport("Invalid Request"))
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