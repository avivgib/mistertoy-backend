import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

const toys = utilService.readJsonFile('data/toy.json')

export const toyService = {
    remove,
    query,
    getById,
    add,
    update,
    addToyMsg,
    removeToyMsg,
}

async function query(filterBy = { txt: '' }) {
    try {
        const collection = await dbService.getCollection('toys')
        console.log(`collection: ${collection}`)
        let criteria = {}

        if (filterBy.txt) {
            criteria.name = { $regex: filterBy.txt, $options: 'i' }
        }

        if (filterBy.labels && filterBy.labels.length) {
            criteria.labels = { $in: filterBy.labels }
        }

        if (filterBy.inStock !== undefined) {
            criteria.inStock = JSON.parse(filterBy.inStock)
        }

        let toys = await collection.find(criteria).toArray()

        if (filterBy.sortBy) {
            if (filterBy.sortBy === 'name') {
                toys.sort((a, b) => a.name.localeCompare(b.name))
            } else if (filterBy.sortBy === 'price') {
                toys.sort((a, b) => a.price - b.price)
            } else if (filterBy.sortBy === 'createdAt') {
                toys.sort((a, b) => a.createdAt - b.createdAt)
            }
        }

        return toys
    } catch (err) {
        logger.error('cannot find toys', err)
        throw err
    }
}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toys')
        const toy = await collection.findOne({ _id: ObjectId.createFromHexString(toyId) })
        toy.createdAt = toy._id.getTimestamp()
        return toy
    } catch (err) {
        logger.error(`while finding car ${toyId}`, err)
        throw err
    }
}

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toys')
        const { deletedCount } = await collection.deleteOne({ _id: ObjectId.createFromHexString(toyId) })
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove car ${toyId}`, err)
		throw err
    }
}

async function add(toy) {
    try {
        const collection = await dbService.getCollection('toys')

        if (toy._id) {
			const toyId = new ObjectId(toy._id)
			await collection.updateOne(
				{ _id: toyId },
				{ $set: { ...toy } }
			)
		} else {
			toy._id = new ObjectId()
			toy.createdAt = Date.now()
			toy.inStock = true
			await collection.insertOne(toy)
		}

		return toy
    } catch (err) {
        logger.error('cannot insert toy', err)
		throw err
    }
}

async function update(toy) {
	try {
		const toyToSave = {
			name: toy.name,
			price: toy.price,
			inStock: toy.inStock,
			labels: toy.labels,
		}
		const collection = await dbService.getCollection('toys')
		await collection.updateOne(
			{ _id: new ObjectId.createFromHexString(toy._id) },
			{ $set: toyToSave }
		)
		return toy
	} catch (err) {
		logger.error(`cannot update toy ${toy._id}`, err)
		throw err
	}
}

async function addToyMsg(toyId, msg) {
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

async function removeToyMsg(toyId, msgId) {
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
