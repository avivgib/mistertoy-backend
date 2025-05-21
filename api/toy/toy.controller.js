import { toyService } from "./toy.service.js"
import { logger } from "../../services/logger.service.js"

export async function getToys(req, res) {
    try {
        const { txt, inStock, sortBy } = req.query
        const labels = req.query['labels[]'] || req.query.labels || []

        let labelsArr = []
        if (Array.isArray(labels)) {
            labelsArr = labels
        } else if (typeof labels === 'string') {
            labelsArr = labels.split(',')
        }

        const filterBy = {
            txt: txt || '',
            inStock: inStock === 'true' ? true : inStock === 'false' ? false : undefined,
            labels: labelsArr,
            sortBy: sortBy || ''
        }

        const toys = await toyService.query(filterBy)

        // console.log('toys', toys)
        // console.log('toys count:', toys.length)
        // console.log('filterBy', filterBy)

        res.send(toys)
    } catch (err) {
        logger.error('Failed to get toys', err)
        res.status(500).send({ err: 'Failed to get toys', details: err.message || err })
    }
}

export async function getToyById(req, res) {
    try {
        const toyId = req.params.id
        const toy = await toyService.getById(toyId)
        res.send(toy)
    } catch (err) {
        logger.error('Failed to get toy', err)
        res.status(500).send({ err: 'Failed to get toy' })
    }
}

export async function addToy(req, res) {
    // const { loggedInUser, body: toy } = req
    const { body: toy } = req

    try {
        // toy.owner = loggedInUser
        const addedToy = await toyService.add(toy)
        res.send(addedToy)
    } catch (err) {
        logger.error('Failed to add toy', err)
        res.status(500).send({ err: 'Failed to add toy' })
    }
}

export async function updateToy(req, res) {
    // const { loggedInUser, body: toy } = req
    // const { _id: userId, isAdmin } = loggedInUser
    const { body: toy } = req

    // if (!isAdmin && toy.owner._id !== userId) {
    //     res.status(403).send('Not your toy...')
    //     return
    // }

    try {
        // const toy = { ...req.body, _id: req.params.id }
        const updateToy = await toyService.update(toy)
        res.send(updateToy)
    } catch (err) {
        logger.error('Failed to update toy', err)
        res.status(500).send({ err: 'Failed to update toy' })
    }
}

export async function removeToy(req, res) {
    try {
        const toyId = req.params.id
        const deletedCount = await toyService.remove(toyId)
        res.send(`${deletedCount} toys removed`)
    } catch (err) {
        logger.error('Failed to remove toy', err)
        res.status(500).send({ err: 'Failed to remove toy' })
    }
}

export async function addToyMsg(req, res) {
    const { loggedInUser } = req
    try {
        const toyId = req.params.id
        const msg = {
            txt: req.body.txt,
            by: loggedInUser,
        }
        const savedMsg = await toyService.addToyMsg(toyId, msg)
        res.json(savedMsg)
    } catch (err) {
        logger.error('Failed to add toy msg', err)
        res.status(400).send({ err: 'Failed to add toy msg' })
    }
}

export async function removeToyMsg(req, res) {
    // const { loggedinUser } = req
    try {
        // const toyId = req.params.id
        const { id: toyId, msgId } = req.params

        const removedId = await toyService.removeToyMsg(toyId, msgId)
        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove toy msg', err)
        res.status(500).send({ err: 'Failed to remove toy msg' })
    }
}