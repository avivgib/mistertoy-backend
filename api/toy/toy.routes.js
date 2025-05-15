import express from 'express'
import { 
        getToys, 
        getToyById, 
        addToy,
        updateToy, 
        removeToy, 
        addToyMsg, 
        removeToyMsg 
    } from './toy.controller.js'

export const toyRoutes = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

toyRoutes.get('/', getToys)
toyRoutes.get('/:id', getToyById)
toyRoutes.post('/', addToy)
toyRoutes.put('/:id', updateToy)
toyRoutes.delete('/:id', removeToy)

toyRoutes.post('/:id/msg', addToyMsg)
toyRoutes.delete('/:id/msg/:msgId', removeToyMsg)