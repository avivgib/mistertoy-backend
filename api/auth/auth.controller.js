import { authService } from "./auth.service.js"
import { logger } from "../../services/logger.service.js"

export async function login(req, res) {
    const { username, password } = req.body
    try {
        const user = await authService.login(username, password)
        const loginToken = authService.getLoginToken(user)

        logger.info('User login:', user)

        res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
        res.json(user)
    } catch (err) {
        logger.error('Failed to Login ' + err)
        res.status(401).send({ err: 'Failed to Login' })
    }
}

export async function signup(req, res) {
    // console.log(`account: ${req.body}`)
    console.log('account:', JSON.stringify(req.body, null, 2))

    try {
        const { username, password, fullname } = req.body

        // IMPORTANT!!! 
        // Never write passwords to log file!!!
        // logger.debug(fullname + ', ' + username + ', ' + password)

        const account = await authService.signup({ username, password, fullname })
        logger.debug(`auth.route - new account created: ` + JSON.stringify(account))

        const user = await authService.login(username, password)
        logger.info('User signup:', user)

        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken)
        res.send(user)
    } catch (err) {
        logger.error('Failed to signup ' + err)
        res.status(500).send({ err: 'Failed to signup' })
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie('loginToken')
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(500).send({ err: 'Failed to logout' })
    }
}