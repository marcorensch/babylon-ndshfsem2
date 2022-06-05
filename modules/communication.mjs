/**
 * Response Klasse für verschiedene Response Arten
 * @author Claudia
 */

export class Transport {

    constructor(message) {
        this.message = message
    }


}

export class ErrorResponse extends Transport{

    constructor(message, row, type, description) {
        super(message)
        this.row = row
        this.type = type
        this.description = description
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

