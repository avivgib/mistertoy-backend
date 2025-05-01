import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import path from 'path'

import { loggerService } from './services/logger.service.js'
import { toyService } from './services/toy.service.js'

const app = express()
//* App Configuration
app.use(cookieParser()) // for res.cookies
app.use(express.json()) // for req.body
// console.log('process.env.NODE_ENV:', process.env.NODE_ENV)

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('public'))
} else {
    const corsOptions = {
        origin: [
            'http://127.0.0.1:3000',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174',
        ],
        credentials: true,
    }
    app.use(cors(corsOptions))
}

console.log('HYE');


// **************** Toys API ****************:
app.get('/api/toy', (req, res) => {
    console.log('req query:', req.query)
    // console.log('req sort:', req.query.sortBy)
    
    const filterBy = {
        txt: req.query.name || '',
        sortBy: req.query.sortBy || '',
        labels: req.query.labels || [],
        inStock: req.query.inStock === undefined ? undefined :
                 req.query.inStock === 'true' ? true :
                 req.query.inStock === 'false' ? false :undefined
    }
    
    toyService.query(filterBy)
        .then(toys => res.send(toys))
        .catch(err => {
                loggerService.error('Cannot load toys', err)
            res.status(400).send('Cannot load toys')
        })
})

app.post('/api/toy', (req, res) => {
    console.log('POSTTT');
    
})


// Fallback
app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

//* Listen will always be the last line in our server!
const port = process.env.PORT || 3030
app.listen(port, () => {
    loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
})
