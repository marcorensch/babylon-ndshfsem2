export class Row{
    rowNum;string;key;value_orig;value_translated;checks;
    constructor(rowNum, string) {
        this.rowNum = rowNum
        this.string = string
        this.checks = {}
        this.value_translated = ""
        this.buildKeyValue(string.trim())
    }

    buildKeyValue(string){
        console.log(string)
        if(!string.length || string === undefined || string === 'undefined' || string.startsWith(";") || !string.includes("=")){
            return [null,null, string]
        }else{
            const [key, ...rest] = string.split('=')
            let value = rest.join('=').trim()
            // Added for SEM2-42
            // Stripe out doublequotes on start / end of string because could lead to translation form errors
            this.value_orig = value.replace(/^"/, '').replace(/"$/, '');
            this.key = key
        }
    }
}
