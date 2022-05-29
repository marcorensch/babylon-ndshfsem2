import path from "path";

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