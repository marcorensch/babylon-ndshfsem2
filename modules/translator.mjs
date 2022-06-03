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
export async function translate(value, authKey, sourceLang, targetLang) {

    const translator = new deepl.Translator(authKey);
    const result = await translator.translateText(value, sourceLang, targetLang);
    return result.text
}