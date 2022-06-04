import * as deepl from 'deepl-node';


/**
 * Übersetzt den übergebenen Wert in die gewählte Zielsprache mit Hilfe der Deepl-API.
 * Für die Deepl-API braucht es einen gültigen Key.
 * Link zur Anmeldung bei Deepl: https://www.deepl.com/pro-api?cta=header-pro-api
 * @param value {String}
 * @param authKey {String}
 * @param sourceLang {String}
 * @param targetLang {String}
 * @returns {Promise<string>}
 * @author Claudia
 */
async function translate(value, authKey, sourceLang, targetLang) {

    const translator = new deepl.Translator(authKey);
    const result = await translator.translateText(value, sourceLang, targetLang);
    return result.text
}

/**
 * Das gemappte Array wird durchlaufen und bei Row Objekten die einen String Inhalt haben in der Eigenschaft value_orig,
 * wird dieser String der Deepl API inkl. authKey, source Language und target Language mit Hilfe der translate Funktion zur Übersetzung übergeben.
 * Der übersetze String wird nun dem Row Objekt mit der Eigenschaft value_transalted zugewiesen.
 * @param mapped {String, Object []}
 * @param authKey {String}
 * @param srcLng {String}
 * @param trgLng {String}
 * @returns {Promise<*>}
 * @author Claudia
 */
export async function translation(mapped, authKey, srcLng, trgLng) {
    for (const row of mapped) {
        if (!(row === "" || row[0] === ";" || row.value_orig === "")) {
            try {
                row.value_translated = await translate(row.value_orig, authKey, srcLng, trgLng)


            } catch (err) {
                console.error(err)
                // res.status(500).send(new ErrorResponse("Translator Error", 2, "Whoopsie", "oopsie"))
            }
        }

    }
    return mapped
}

/**
 * Überprüft mittels deepl-node den bisherigen Verbrauch des Authkeys.
 * @param authKey{String}
 * @returns {Promise<string>}
 * @autor Claudia
 */
export async function checkUsage(authKey) {

    try{
        const translator = new deepl.Translator(authKey);
        const usage = await translator.getUsage();
        if (usage.anyLimitReached()) {
            return 'Translation limit exceeded.'
        }
        if (usage.character) {
            return `Characters: ${usage.character.count} of ${usage.character.limit}`

        }
    }catch (err){
        return err.toString()
    }

}

/**
 * Abfrage an Deepl-API welche Sprachen als Quell/ZielSprachen Supportet werden.
 * @param authKey{String}
 * @returns {Promise<{srcLng: *[], trgLng: *[]}>}
 * @author Claudia
 */
export async function getLanguages(authKey) {
    try{
        const translator = new deepl.Translator(authKey);

        let languages = {
            srcLng:[],
            trgLng:[]
        }
        languages.srcLng = await translator.getSourceLanguages()


        languages.trgLng = await translator.getTargetLanguages()


        return languages
    }catch (err){
        console.log(err)
    }


}