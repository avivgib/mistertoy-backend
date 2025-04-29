import { utilService } from "./util.service.js"

const toys = utilService.readJsonFile('data/toy.json')

export const toyService = {
    query,
    getById,
    remove,
    save
}

function query(filterBy) {
    console.log('toys', filterBy)
    let filteredToys = toys
    
    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        filteredToys = filteredToys.filter(toy => regExp.test(toy.name))
    }
    return Promise.resolve(filteredToys)


    // return Promise.resolve(toys)
    //     .then(toys => {
    //         if (filterBy.txt) {
    //             const regExp = new RegExp(filterBy.txt, 'i')
    //             toys = toys.filter(toy => regExp.test(toy.name))
    //         }

    //         console.log('toys', toys)
    //         return toys 
    //     })
}

function getById(toyId) {
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

function save(toyToSave) {
    if (toyToSave._id) {
        const toyIdx = toys.findIndex(toy => toy._id === toyToSave._id)
        toys[toyIdx].name = toyToSave.name
    } else {
        toyToSave._id = utilService.makeId()
        toys.unshift(toyToSave)
    }

    return _saveToysToFile().then(() => toyToSave)

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