import path from "path";
import fs from "fs";
import {Row} from "./Row.mjs";
import {clean} from "mocha/lib/utils.js";


export function uploadPath(uuid, filename){
    return './upload/' + uuid + '/' + filename;
}

export function downloadPath(uuid, filename){
    return './download/' + uuid + '/' + filename;
}

export function downloadHttp(uuid, filename){
    return `http://localhost:3000/download/${uuid}/${filename}`
}

/**
 * Prüft ob der Filetyp valide ist.
 * @param filename{String}
 * @returns {boolean}
 * @autor Claudia
 */
export function validFiletype(filename){
    let validTypes = [".txt", ".ini"]
    return validTypes.includes(path.extname(filename.toLowerCase()))
}


/**
 * Prüft ob der Filename Leerschläge (ersetzt durch Bindestriche) oder Sonderzeichen enthält (werden entfernt).
 * Der Filetype wird vor der Überprüfung entfernt und am Ende wieder hinzugefügt.
 * @param filename{String}
 * @returns {string}
 * @author Claudia
 */
export function cleanFilename(filename){

    let extension = path.extname(filename.toLowerCase())
    let name = filename.split(".").slice(0, -1).toString()
    name = name.replace(/\s+/gi, '-') // Replace white space with dash
    name = name.replace(/[^a-z\d\-_]/gi, '')// Strip any special charactere (ergänzt => _ erlaubt)

    return name.concat(extension)


}



/**
 *Erstellt einen Ordner mit der erstellten uuid und verschiebt das hochgeladene File in den neuen Ordner.
 * @param uuid{String}
 * @param filename{String}
 * @param uploadFile{Object}
 * @returns {Promise<void>}
 * @author Claudia
 */

export async function moveFile(uuid, filename, uploadFile) {
    try {
        await fs.mkdir('./upload/' + uuid, {recursive: true}, (err) => {
            if (err) throw err;
        });
    } catch (err) {
        console.log(err)
    }
    await uploadFile.mv('./upload/' + uuid + '/' + filename);
}

/**
 * Löscht zuerst das File im Ziel-Ordner und nachher den Ziel-Ordner selbst.
 * @param pathDir{String}
 * @returns {Promise<void>}
 * @autor Claudia
 */
/* Wird aktuell nicht genutzt
export async function deleteFileAndFolder(pathDir){
    await fs.readdir(pathDir, async (err, files) => {
        if (err) {
            console.log(err)
        } else {
            console.log(files)
            try {
                // löscht zuerst die files im folder
                await fs.unlink(pathDir + '/' + files.toString(), () => {
                    console.log("File deleted ")
                })
                await fs.rmdir(pathDir, () => {
                    console.log("folder deleted")
                })

            } catch (err) {
                console.log(err)
            }
        }
    })
}
*/

/**
 * Liest ein File ein und übergibt jede Zeile in ein Array
 * @param path{String}
 * @returns {string[]}
 * @author Claudia
 */
export function readRows(path){
    try{
        // read content of the File
        const data = fs.readFileSync(path, {encoding:"utf-8"})

        //split the content by new line (achtung lines mit leeren Strings)
        return data.trim().split(/\r?\n/)

    }catch (err){
        console.error(err)
    }
}

/**
 * Erstellt im Download Ordner ein Unterordner mit der UUID und ein leeres File
 * @param uuid{String}
 * @param filename{String}
 * @author Claudia, Marco
 */
export function createEmptyDownloadFolderAndFileSync(uuid, filename) {
    const path = './download/' + uuid
    try {
        fs.mkdirSync(path, {recursive: true})
        fs.writeFileSync(path + '/' + filename, "", {encoding:"utf-8"})
        console.log('Empty File was created successfully.');
    } catch (err) {
        console.log("File could not been created",err)
    }
}

/**
 * Schreibt ein String Array in ein File und macht nach jedem index einen neuen Absatz.
 * @param data{String[]}
 * @param path{String}
 * @autor Claudia, Marco
 */
export function writeToFile(data, path) {
    let newLine = process.platform === 'win32' ? '\r\n' : '\n';
    try {
        //flag: a = Open file for appending. The file is created if it does not exist
        const stream = fs.createWriteStream(path, {flags: 'a', encoding: 'utf-8'});
        stream.on('ready', () => {
            data.forEach(function (line) {
                stream.write(line + newLine);
            });
            stream.end(()=>{
                stream.on('finish', () => {
                    console.log(`========= ${path} written successfully! =========`)
                })
            });
        })
    } catch (err) {
        console.error("Error while write to file", err)
    }
}

/**
 * Das Array von dem ausgelesenen File wird mapped, leere Strings und Strings die mit ";" beginnen werden direkt
 * ins neue Array mapped und alle anderen Strings werden in Key und Value Paare gesplittet, wenn ein "=" vorhanden ist.
 * Die Paare werden in ein Row Objekt abgefüllt inkl. der aktuellen row nummer.
 * @param rows{String[]}
 * @returns {String, Object []}
 * @author Claudia
 */
export function prepareRowData(rows) {
    return rows.map((row, index) => {
        if (row.length === 0 || row.startsWith(";")) {
            return row
        } else if (row.includes("=")) {
            return new Row(index + 1, row)
        } else{
            return `;!!!!!!!!!!!!!!!!!!!!! Ignored row, content: ${row} !!!!!!!!!!!!!!!!!!!!!`
        }
    })
}

/**
 * Das übersetze Array wird wieder mapped. Wenn leere Strings oder Strings mit ";"beginnen werden sie direkt ins neue Array mapped.
 * Die Row Objekte werden so mapped, dass die Eigenschaften key und value_translated mit einem "=" zusammengesetzt werden und asl String ins neue Array gemappt werden.
 * @param translatedData{String, Object []}
 * @returns {String []}
 * @autor Claudia
 */
export function prepareDataForNewFile(translatedData) {
    return translatedData.map((value) => {
        if (value.length === 0 || value[0] === ";") {
            return value
        } else {
            return value.key.concat("=" + value.value_translated)
        }
    })
}

