import { Server } from "socket.io"

let io = null

export function setupSocketAPI(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: [
                'http://127.0.0.1:3000',
                'http://localhost:3000',
                'http://127.0.0.1:5173',
                'http://localhost:5173',
                'http://127.0.0.1:5174',
                'http://localhost:5174',
            ],
            credentials: true,
        },
    })

    io.on('connection', socket => {
        console.log(`🔌 New socket connected – id: ${socket.id}`)

        // Join a room (based on toyId)
        socket.on('chat-join', toyId => {
            socket.join(toyId)
            console.log(`🧸 Socket ${socket.id} joined room ${toyId}`)
        })

        // Handle new chat message
        socket.on('chat-msg', ({ toyId, msg }) => {
            console.log(`💬 New msg on toy ${toyId}:`, msg)
            io.to(toyId).emit('chat-msg', msg)
        })

        // HAndle "user is typing" event
        socket.on('chat-typing', ({ toyId, user }) => {
            socket.to(toyId).emit('chat-typing', user)
            console.log(`✏️ ${user} is typing...`)
        })

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`👋 Socket ${socket.id} disconnected`)
        })
    })
}