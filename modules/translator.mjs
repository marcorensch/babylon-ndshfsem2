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
export async function translation(mapped, authKey, srcLng, trgLng) {
    for (const row of mapped) {
        console.log(row.value_orig)
        if (row === "" || row[0] === ";" || row.value_orig === "") {
            console.log("Zeile ohne value: " + row)
        } else {

            try {
                row.value_translated = await translate(row.value_orig, authKey, srcLng, trgLng)
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