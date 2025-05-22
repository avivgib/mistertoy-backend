import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

const PAGE_SIZE = 3

export const toyService = {
    remove,
    query,
    getById,
    add,
    update,
    addMsg,
    removeMsg,
}

async function query(filterBy = {}) {
    try {
        const { filterCriteria, sortCriteria, skip } = _buildCriteria(filterBy)

        const collection = await dbService.getCollection('toys')

        const filteredToys = await collection
            .find(filterCriteria)
            .collation({ locale: 'en', numericOrdering: true })
            .sort(sortCriteria)
            .skip(skip)
            // .limit(PAGE_SIZE)
            .limit(100)
            .toArray()
        // console.log(`filteredToys: ${filteredToys}`)

        const totalCount = filteredToys.length
        const maxPage = Math.ceil(totalCount / PAGE_SIZE)

        return filteredToys
    } catch (err) {
        logger.error('cannot find toys', err)
        throw err
    }
}

async function getById(toyId) {
    try {
        if (!_isValidObjectId(toyId)) throw new Error('Invalid toyId')
        const collection = await dbService.getCollection('toys')
        const toy = await collection.findOne({ _id: new ObjectId(toyId) })
        if (!toy) throw new Error('Toy not found')
        toy.createdAt = toy._id.getTimestamp()
        return toy
    } catch (err) {
        logger.error(`while finding toy ${toyId}`, err)
        throw err
    }
}

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toys')
        await collection.deleteOne({ _id: ObjectId.createFromHexString(toyId) })
        // return deletedCount
    } catch (err) {
        logger.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}

async function add(toy) {
    try {
        toy.inStock = true
        const collection = await dbService.getCollection('toys')
        await collection.insertOne(toy)
        toy.createdAt = toy._id.getTimestamp()
        return toy
    } catch (err) {
        logger.error('cannot insert toy', err)
        throw err
    }
}


async function update(toy) {
    try {
        logger.debug(`[TOY SERVICE] update - start`, { toyId: toy._id, toy })

        const { name, price, labels } = toy
        const toyToUpdate = { name, price, labels }

        const collection = await dbService.getCollection('toys')
        logger.debug(`[TOY SERVICE] update - got collection`)

        const objectId = new ObjectId(toy._id)
        logger.debug(`[TOY SERVICE] update - objectId created`, { objectId })

        const result = await collection.updateOne(
            { _id: objectId },
            { $set: toyToUpdate }
        )
        logger.debug(`[TOY SERVICE] update - updateOne result`, { result })

        if (result.matchedCount === 0) {
            throw new Error(`Toy with id ${toy._id} not found`)
        }

        logger.debug(`[TOY SERVICE] update - success`)
        return toy
    } catch (err) {
        logger.error(`[TOY SERVICE] update - error`, err)
        throw err
    }
}


async function addMsg(toyId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('toys')
        await collection.updateOne(
            { _id: new ObjectId.createFromHexString(toyId) },
            { $push: { msgs: msg } },
            { upsert: false }
        )
        return msg
    } catch (err) {
        logger.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

async function removeMsg(toyId, msgId) {
    try {
        const collection = await dbService.getCollection('toys')
        await collection.updateOne(
            { _id: new ObjectId.createFromHexString(toyId) },
            { $pull: { msgs: { id: msgId } } }
        )
        return msgId
    } catch (err) {
        logger.error(`cannot remove toy msg ${toyId}`, err)
        throw err
    }
}


function _buildCriteria(filterBy) {
    const filterCriteria = {}

    if (filterBy.txt) {
        filterCriteria.name = { $regex: filterBy.txt, $options: 'i' }
    }

    if (filterBy.inStock !== undefined) {
        filterCriteria.inStock = JSON.parse(filterBy.inStock)
    }

    if (filterBy.labels?.length) {
        filterCriteria.labels = { $in: filterBy.labels }
        // filterCriteria.labels = { $all: filterBy.labels }
    }

    const sortCriteria = {}
    const sortBy = filterBy.sortBy

    // if (sortBy && sortBy.type) {
    if (sortBy) {
        // const sortDirection = +sortBy.sortDir
        // sortCriteria[sortBy.type] = sortDirection
        sortCriteria[sortBy] = 1
    } else {
        sortCriteria.createdAt = -1
    }

    const skip = filterBy.pageIdx !== undefined ? filterBy.pageIdx * PAGE_SIZE : 0

    return { filterCriteria, sortCriteria, skip }
}

function _isValidObjectId(id) {
    return ObjectId.isValid(id) && (String)(new ObjectId(id)) === id
}
