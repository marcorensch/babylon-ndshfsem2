import * as deepl from 'deepl-node';


/**
 * Translated the value into the given language. Uses the Deepl-API for translating.
 * Needs a valid authKey from the Deepl-API.
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
    console.log(result.text);
    return result.text
}