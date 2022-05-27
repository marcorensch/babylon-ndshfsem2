/**
 * Response Class for different responsetypes
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

export class UpdateResponse  extends Response {

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

