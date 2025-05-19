import express from 'express'

import { requireAdmin, requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { getToys, getToyById, addToy, addToyMsg, removeToy, removeToyMsg, updateToy } from './toy.controller.js'
import { log } from '../../middlewares/logger.middleware.js'

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