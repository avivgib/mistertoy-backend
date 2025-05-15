import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import { logger } from './services/logger.service.js'
logger.info('server.js loaded...')

const app = express()
//* App Configuration
app.use(cookieParser()) // for res.cookies
app.use(express.json()) // for req.body
app.use(express.static('public'))
// console.log('process.env.NODE_ENV:', process.env.NODE_ENV)

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'public')))
} else {
    // Configuring CORS
    // Make sure origin contains the url 
    // your frontend dev-server is running on
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

import { authRoutes } from './api/auth/auth.routes.js'
import { toyRoutes } from './api/toy/toy.routes.js'

// routes
app.use('/api/auth', authRoutes)
app.use('/api/toy', toyRoutes)


// Fallback
app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

//* Listen will always be the last line in our server!
const port = process.env.PORT || 3030
app.listen(port, () => {
    logger.info(`Server listening on port http://127.0.0.1:${port}/`)
})
