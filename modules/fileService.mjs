import path from "path";
import fs from "fs";

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
 * @param existingUuid{String}
 * @returns {Promise<void>}
 * @autor Claudia
 */
export async function deleteFileAndFolder(pathDir, existingUuid){
    fs.readdir(pathDir, async (err, files) => {
        if (err) {
            console.log(err)
        } else {
            console.log(files)
            try {
                // löscht zuerst die files im folder
                await fs.unlink('./upload/' + existingUuid + '/' + files.toString(), () => {
                    console.log("File deleted in upload")
                })
                await fs.rmdir("./upload/" + existingUuid, () => {
                    console.log("folder deleted")
                })

            } catch (err) {
                console.log(err)
            }
        }
    })
}

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
export async function createEmptyDownloadFolder(uuid) {
    try {
        await fs.mkdir('./download/' + uuid, {recursive: true}, (err) => {
            if (err) throw err;
        });

    } catch (err) {
        console.log(err)
    }
}
export function writeToFile(data, path) {
    //flag: a = Open file for appending. The file is created if it does not exist
    const stream = fs.createWriteStream(path, {flags: 'a'});

    // append data to the file
    data.forEach((row) => {
        stream.write(row + "\n", error => {
            if (error){
                console.error(error)
            }
        });
    });

    // end stream
    stream.end();


}

