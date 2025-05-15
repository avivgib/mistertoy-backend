import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'

import { ObjectId } from 'mongodb'
import { updateToy } from '../toy/toy.controller.js'

export const userService = {
    query,
    getById,
    getByUsername,
    remove,
    update,
    add
}

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('users')
        var users = await collection.find(criteria).sort({ username: 1 }).toArray()
        users = users.map(user => {
            delete user.password
            user.createdAt = user._id.getTimestamp()
            return user
        })
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        const collection = await dbService.getCollection('users')
        const user = await collection.findOne({ _id: ObjectId.createFromHexString(userId) })
        delete user.password
        return user
    } catch (err) {
        logger.error(`while finding user ${userId}`, err)
        throw err
    }
}

async function getByUsername(username) {
    console.log('Insert to getByUsername', username)
    try {
        // Not get collection
        const collection = await dbService.getCollection('users')
        console.log('collection', collection)
        // Not get user
        const user = await collection.findOne({ username })
        console.log('user', user) 
        return user
    } catch (err) {
        logger.error(`while finding user ${username}`, err)
		throw err
    }
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection('users')
        await collection.deleteOne({ _id: ObjectId.createFromHexString(userId) })
        return user
    } catch (err) {
        logger.error(`while finding user ${userId}`, err)
		throw err
    }
}

async function update(user) {
    try {
        const userToSave = {
            _id: ObjectId.createFromHexString(user._id),
            username: user.username,
            fullname: user.fullname,
            score: user.score
        }
        const collection = await dbService.getCollection('users')
        await collection.updateOne({_id: userToSave._id}, {$set: userToSave})
        return userToSave
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
		throw err
    }
}

async function add(user) {
    try {
        // Validate that there are no such user:
		const existUser = await getByUsername(user.username)
        console.log('existUser', existUser)
		if (existUser) throw new Error('Username taken')

		// peek only updatable fields!
		const userToAdd = {
			username: user.username,
			password: user.password,
			fullname: user.fullname,
			score: user.score || 0,
		}
        console.log('userToAdd', userToAdd)

		const collection = await dbService.getCollection('users')
		await collection.insertOne(userToAdd)
		return userToAdd
    } catch (error) {
        logger.error('cannot insert user', err)
		throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            {
                username: txtCriteria,
            },
            {
                fullname: txtCriteria,
            },
        ]
    }
    if (filterBy.minPrice) {
        criteria.price = { $gte: filterBy.minPrice }
    }
    return criteria
}