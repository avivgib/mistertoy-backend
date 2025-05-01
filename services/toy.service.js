import fs from 'fs'
import { utilService } from "./util.service.js"
import { loadEnvFile } from 'process'

const toys = utilService.readJsonFile('data/toy.json')

export const toyService = {
    query,
    get,
    remove,
    save
}

function query(filterBy) {
    let filteredToys = toys

    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        filteredToys = filteredToys.filter(toy => regExp.test(toy.name))
    }

    if (filterBy.labels && filterBy.labels.length) {
        filteredToys = filteredToys.filter(toy => 
            toy.labels.some(label => filterBy.labels.includes(label))
        )
    }

    if (filterBy.inStock !== undefined) {
        filteredToys = filteredToys.filter(toy => toy.inStock === filterBy.inStock)
    }
   
    if (filterBy.sortBy) {
        console.log('into sort', filterBy.sortBy)
        if (filterBy.sortBy === 'name') {
            filteredToys = filteredToys.sort((a, b) => a.name.localeCompare(b.name))
        } else if (filterBy.sortBy === 'price') {
            filteredToys = filteredToys.sort((a, b) => a.price - b.price)
        } else if (filterBy.sortBy === 'createdAt') {
            filteredToys = filteredToys.sort((a, b) => a.createdAt - b.createdAt)
        }
    }

    return Promise.resolve(filteredToys)
}

function get(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    if (!toy) return Promise.reject('Cannot find toy - ' + toyId)
    return Promise.resolve(toy)
}

function remove(toyId) {
    const toyIdx = toys.findIndex(toy => toy._id === toyId)
    if (toyIdx === -1) return Promise.reject('Cannot remove toy - ' + toyId)
    toys.splice(toyIdx, 1)
    return _saveToysToFile()
}

function save(toy) {
    if (toy._id) {
        const idx = toys.findIndex(currToy => currToy._id === toy._id)
        toys[idx] = { ...toys[idx], ...toy }
    } else {
        toy._id = utilService.makeId()
        toy.createdAt = Date.now()
        toy.inStock = true
        toys.unshift(toy)
    }
    return _saveToysToFile().then(() => toy)
}

function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(toys, null, 4)
        fs.writeFile('data/toy.json', data, (err) => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    })
}