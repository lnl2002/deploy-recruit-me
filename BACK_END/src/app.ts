import express from 'express'
import { config } from 'dotenv'
config()

const app = express()
const PORT = process.env.PORT || 9999

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(PORT, () => {
    console.log(`Connected to port ${PORT}`)
})