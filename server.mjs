import express from "express"
import fs from "fs"

const server = express()
const port = 3000

server.get('/', (req, res) => {
    res.send('Hello World!')
})



server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})