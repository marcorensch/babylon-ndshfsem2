import fs from "fs";
import path from "path";

/**
 * Clean-Up Klasse für abgelegte Dateien auf dem Server.
 * @author Claudia
 */
export class Walle {

    /**
     * Prüft alle Dateien im Upload Ordner auf ihr Alter. Dateien die älter als 4 Stunden sind, werden im Upload Ordner + im Download Ordner gelöscht.
     * Das maximal Alter der Dateien kann via Parameter in Millisekunden konfiguriert werden.
     * @param maxFileAgeInMs
     * @author Claudia
     */
    static garbageService(maxFileAgeInMs) {
        // 4 hours = 14400000
        this.getAllPaths().forEach(filePath => {
            fs.stat(filePath, (error, stats) => {
                if (error) {
                    console.error(error)
                } else {
                    let timeNowMinusFourHours = new Date().getTime() - maxFileAgeInMs // millisekunden für 4 stunden als variable
                    let creatingTimeFile = stats.birthtime.getTime()
                    console.log("file: " + filePath + " was created: " + creatingTimeFile)

                    if (creatingTimeFile < timeNowMinusFourHours) {//creatingTimeFile < timeNowMinusFourHours => set true for testing
                        let uploadFoldername = path.dirname(filePath).split("/").pop()
                        let uploadPathToFolder = path.dirname(filePath)
                        let downloadPathToFolder = "./download/" + uploadFoldername  //mit Pfad zum Download Ordner


                        //delete in Download und Upload
                        fs.rmSync(downloadPathToFolder, {recursive: true, force: true});
                        fs.rmSync(uploadPathToFolder, {recursive: true, force: true});

                        console.log("Files > 4h old => Files + Directory in Upload and Download deleted")

                    } else {
                        console.log("Files < 4h old => No File deleted")

                    }
                }
            })
        })
    }

    /**
     * Gibt alle Pfade zu den Files im Upload Ordner zurück, ausser .gitkeep Dateien.
     * @returns {string[]}
     * @author Claudia
     */
    static getAllPaths() {
        const folderPath = './upload';
        let folders = fs.readdirSync(folderPath);

        // Filtert alle .gitkeep dateien heraus
        let filteredFolders = folders.filter(folder => {
            if (!folder.startsWith(".")) {
                return folder
            }
        })

        return filteredFolders.map(folder => {
            let file = fs.readdirSync("./upload/" + folder)
            return "./upload/".concat(folder + "/" + file)

        })
    }

}

