import { MongoClient } from 'mongodb'

import { config } from '../config/index.js'
import { logger } from './logger.service.js'

export const dbService = {
    getCollection,
}

var dbConn = null

async function getCollection(collectionName) {
    // console.log(`collectionName: ${collectionName}`)
    try {
        const db = await _connect()
        // console.log(`DB: ${db}`)
        const collection = await db.collection(collectionName)
        // console.log(`collection: ${collection}`)
        return collection
    } catch (err) {
        logger.error('Failed to get Mongo collection', err)
		throw err
    }
}

async function _connect() {
    if (dbConn) return dbConn
    // console.log(`dbConn: ${dbConn}`)
    
    try {
        // console.log(JSON.stringify(config, null, 2))
        // console.log('dbUrl: ', config.dbURL)
        const client = await MongoClient.connect(config.dbURL)
        return dbConn = client.db(config.dbName)
    } catch (err) {
        logger.error('Cannot Connect to DB', err)
		throw err
    }
}