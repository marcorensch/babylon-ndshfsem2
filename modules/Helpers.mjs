/**
 * Prüft ob UUID der RFC4122 entspricht
 * @param uuid{String}
 * @returns {boolean}
 * @author Claudia
 */
export function validUuid(uuid){
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}