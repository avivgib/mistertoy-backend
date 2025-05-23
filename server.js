import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import http from 'http'

import { logger } from './services/logger.service.js'
import { setupSocketAPI } from './services/socket.service.js'

import { authRoutes } from './api/auth/auth.routes.js'
import { toyRoutes } from './api/toy/toy.routes.js'
import { userRoutes } from './api/user/user.routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

logger.info('server.js loaded...')

const app = express()
const server = http.createServer(app)

//* App Configuration
app.use(cookieParser())         // for res.cookies
app.use(express.json())         // for req.body
app.use(express.static('public'))

// CORS
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
            'http://127.0.0.1:5173',
            'http://localhost:5173',
            'http://127.0.0.1:5174',
            'http://localhost:5174',
        ],
        credentials: true,
    }
    app.use(cors(corsOptions))
}

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/toy', toyRoutes)
app.use('/api/user', userRoutes)

// Fallback
app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

// Setup Socket.IO
setupSocketAPI(server)

//* Listen will always be the last line in our server!
const port = process.env.PORT || 3030
server.listen(port, () => {
    logger.info(`Server listening on port http://127.0.0.1:${port}/`)
})