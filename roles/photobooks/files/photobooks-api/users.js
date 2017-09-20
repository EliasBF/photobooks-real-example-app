'use strict'

const urlParse = require('url').parse
const queryParse = require('qs').parse

const { send, json } = require('micro')
const HttpHash = require('http-hash')

const Db = require('photobooks-db')
const utils = require('./lib/utils')
const config = require('./config')
const DbStub = require('./test/stub/db')

const env = process.env.NODE_ENV || 'production'
let db = new Db(config.db)

if (env === 'test') {
  db = new DbStub()
}

const hash = HttpHash()

// crear usuario
// no require auth
// solo desde signup
hash.set('POST /', async function saveUser (req, res, params) {
  let user = await json(req)

  // al hacer signup, no se require avatar
  // avavatar se actualiza desde el perfil
  user.avatar = '/images/default-avatar.jpg'

  await db.connect()
  await db.saveUser(user)
  await db.disconnect()

  send(res, 201)
})

// usuario por userName
hash.set('GET /:userName', async function getUser (req, res, params, query) {
  try {
    let token = await utils.extractToken(req)
    await utils.verifyToken(token, config.secret, {})
  } catch (e) {
    return send(res, 401, { error: 'invalid token' })
  }

  await db.connect()
  let user

  if ('view' in query) {
    user = await db.getUserForView({userName: params.userName})
  } else {
    user = await db.getUser(params.userName)
  }

  await db.disconnect()

  delete user.password

  send(res, 200, user)
})

// TODO : hash.set('POST /:id/follow', async function followUser (req, res, params, query) {}

module.exports = async function main (req, res) {
  let { method, url } = req
  let { pathname, query } = urlParse(url)
  query = queryParse(query)

  let match = hash.get(`${method.toUpperCase()} ${pathname}`)

  if (match.handler) {
    try {
      await match.handler(req, res, match.params, query)
    } catch (e) {
      send(res, 500, { error: e.message })
    }
  } else {
    send(res, 404, { error: 'route not found' })
  }
}
