import configProd from './prod.js'
import configDev from './dev.js'

export var config

console.log('process.env.NODE_ENV', process.env.NODE_ENV)
if (process.env.NODE_ENV === 'production') {
    config = configProd
    console.log('config prod', config)
} else {
    config = configDev
    console.log('config dev', config)
}

// config.isGuestMode = true
// config = configProd
