import express from "express"
import fs from "fs"

// Own Modules
import {translate} from "./Modules/translator.mjs";
import {Response, ErrorResponse, UpdateResponse, TranslateResponse} from "./Modules/communication.mjs";

const server = express()
const port = 3000

/**
 * Info: Middleware for Express
 * express.json() parse json
 * @autor: Claudia
 */
server.use(express.json())



server.post('/upload', (req, res) =>{
    /*  1. File wird vom client hochgeladen,
        2. prüfen ob File hochgeladen wurde, false => res code 404 zurück "No File Uploaded"
        3. file Typ validieren, false => res code 400 zurück "Invalid Filetyp",
        4. uuId generieren, unterordner mit uuId im upload folder erstellen,
        (2. mal hochladen nach checker => uuid schon mitgeben, damit kann das file überschrieben werden und muss keine neue uuid generiert werden(so kann gleiche route benutzt werden)
        5. File in uuId folder verschieben,
        6. res 200 zurück an client mit uuId Objekt für identifizierung des files.
    */
    let file = req.body.message
    console.log(file)
    res.send(new UpdateResponse('Upload file and move it into the upload folder', "kjhkajd-33vfd-4h2k"))
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