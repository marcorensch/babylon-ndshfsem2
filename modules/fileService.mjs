import path from "path";
import fs from "fs";
import {Row} from "./Row.mjs";


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
 * Prüft ob UUID der RFC4122 entspricht
 * @param uuid{String}
 * @returns {boolean}
 * @author Claudia
 */
export function validUuid(uuid){
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

/**
 * Prüft ob der Filename Leerschläge (ersetzt durch Bindestriche) oder Sonderzeichen enthält (werden entfernt).
 * Der Filetype wird vor der Überprüfung entfernt und am Ende wieder hinzugefügt.
 * @param filename{String}
 * @returns {string}
 */
export function cleanFilename(filename){

    let extension = path.extname(filename.toLowerCase())
    let name = filename.split(".").slice(0, -1).toString()
    name = name.replace(/\s+/gi, '-') // Replace white space with dash
    name = name.replace(/[^a-zA-Z0-9\-\_]/gi, '')// Strip any special charactere (ergänzt => _ erlaubt)

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
    //Use the mv() method to place the file in upload directory (i.e. "uploads")
    await uploadFile.mv('./upload/' + uuid + '/' + filename);
}

/**
 * Löscht zuerst das File im Ziel-Ordner und nachher den Ziel-Ordner selbst.
 * @param pathDir{String}
 * @returns {Promise<void>}
 * @autor Claudia
 */
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
 * @returns {Promise<void>}
 * @author Claudia
 */
export async function createEmptyDownloadFolderAndFile(uuid, filename) {
    try {
        await fs.mkdir('./download/' + uuid, {recursive: true}, (err) => {
            if (err) throw err;
        });
        fs.writeFile('./download/' + uuid + '/' + filename, '', function (err) {
            if (err) throw err;
            console.log('File is created successfully.');
        });

    } catch (err) {
        console.log(err)
    }
}

/**
 * Schreibt ein String Array in ein File und macht nach jedem index einen neuen Absatz.
 * @param data{String[]}
 * @param path{String}
 * @autor Claudia
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
 * Das Array von dem ausgelesenen File wird gemapped, so dass leere Strings und Strings die mit ";" beginnen, direkt
 * ins neue Array gemappt werden und alle anderen Strings werden gesplittet, wenn ein "=" vorhanden ist in Key und Value Paare.
 * Die Paare werden in ein Row Objekt abgefüllt inkl. der aktuellen row.
 * @param rows{String[]}
 * @returns {String, Object []}
 * @author Claudia
 */
export function prepareRowData(rows) {
    return rows.map((row, index) => {
        if (row.length === 0 || row.startsWith(";")) {
            return row
        } else if (row.includes("=")) {

            const [key, ...rest] = row.split('=')

            const value = rest.join('=')


            let keyValuePair = [key, value]
            let k = keyValuePair[0]
            let v = keyValuePair[1]

            return new Row(index + 1, k, v)
        } else{
            // TODO: Muss noch getestet werden!
            return `;!!!!!!!!!!!!!!!!!!!!! Ignored row, content: ${row} !!!!!!!!!!!!!!!!!!!!!`
        }
    })
}

/**
 * Das übersetze Array wird wieder gemappt. Wenn leere Strings oder Strings mit ";"beginnen werden sie direkt ins neue Array gemappt.
 * Die Row Objekte werden so gemappt, dass die Eigenschaften key und value_translated mit einem "=" zusammengesetzt werden und asl String ins neue Array gemappt werden.
 * @param translatedData{String, Object []}
 * @returns {String []}
 * @autor Claudia
 */
export function prepareDataForNewFile(translatedData) {
    return translatedData.map((value) => {
        console.log(value)
        if (value.length === 0 || value[0] === ";") {
            return value
        } else {
            return value.key.concat("=" + value.value_translated)
        }
    })
}

