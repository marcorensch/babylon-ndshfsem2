/**
 * Response Klasse für verschiedene Response Arten
 * @author Claudia
 */

export class Response {

    constructor(message) {
        this.message = message
    }


}

export class ErrorResponse extends Response{

    constructor(message, row, type, description) {
        super(message)
        this.row = row
        this.type = type
        this.description = description
    }

}

export class UploadResponse  extends Response {

    constructor(message, uuid) {
        super(message);
        this.uuid = uuid


    }
}

export class TranslateResponse extends Response{

    constructor(message, value) {
        super(message);
        this.value = value

    }
}

