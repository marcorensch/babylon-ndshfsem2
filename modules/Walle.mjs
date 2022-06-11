import fs from "fs";
import path from "path";

export class Walle{

    static garbageService(maxFileAgeInMs, getAllPaths){
        // 4 hours = 14400000
        getAllPaths().forEach(filePath => {
            fs.stat(filePath, (error, stats) => {
                if (error) {
                    console.log(error)
                } else {
                    let timeNowMinusFourHours = new Date().getTime() - maxFileAgeInMs // milisekunden für 4 stunden als variable
                    let creatingTimeFile = stats.birthtime.getTime()
                    console.log("file: " + filePath + " was created: " + creatingTimeFile)

                    if (creatingTimeFile < timeNowMinusFourHours) {//creatingTimeFile < timeNowMinusFourHours => set true for testing
                        let uploadFoldername = path.dirname(filePath).split("/").pop() // foldername for concat download path
                        let uploadPathToFolder = path.dirname(filePath)
                        let downloadPathToFolder = "./download/" + uploadFoldername  //mit Pfad zum Downloadfolder

                        console.log(uploadFoldername + " = Upload Foldername")
                        console.log(uploadPathToFolder + " = uploadpfad zum Upload folder")
                        console.log(downloadPathToFolder + " downloadpfad zum download folder")

                        //delete in Download und Upload
                        fs.rmSync(downloadPathToFolder, { recursive: true, force: true });
                        fs.rmSync(uploadPathToFolder, {recursive: true, force: true});

                        console.log("Directories older than 4H deleted")

                    } else {
                        console.log("Files under 4 Hours old => No File deleted")

                    }
                }
            })
        })
    }

    static getAllPaths() {
        //Todo parentpath als argument definieren?
        const folderPath = './upload';
        let folders = fs.readdirSync(folderPath);
        console.log(folders)

        return folders.map(folder => {
            if (!folder.startsWith(".")){
                console.log(folder)
                let file = fs.readdirSync("./upload/" + folder)
                return "./upload/".concat(folder + "/" + file)
            }
            console.log(folder + " Ist ein .gitkeep placeholder")

        })
    }
}