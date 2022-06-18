/**
 * Response Klasse für verschiedene Response Arten
 * @author Claudia
 */

export class Transport {

    constructor(message, success = true) {
        this.message = message
        this.success = success
    }


}


export class UploadResponse  extends Transport {

    constructor(message, uuid, filename) {
        super(message);
        this.uuid = uuid
        this.filename = filename


    }
}

export class TranslateResponse extends Transport{

    constructor(message, url = '') {
        super(message);
        this.url = url
    }
}

