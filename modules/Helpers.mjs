/**
 * Prüft ob UUID der RFC4122 entspricht
 * @param uuid{String}
 * @returns {boolean}
 * @author Claudia
 */
export function validUuid(uuid){
    return /^[\da-f]{8}-[\da-f]{4}-[1-5][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(uuid);
}