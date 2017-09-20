'use strict'

const { send, json } = require('micro')
const HttpHash = require('http-hash')

const Db = require('photobooks-db')
const config = require('./config')
const utils = require('./lib/utils')
const DbStub = require('./test/stub/db')

const env = process.env.NODE_ENV || 'production'
let db = new Db(config.db)

if (env === 'test') {
  db = new DbStub()
}

const hash = HttpHash()

// authenticar
hash.set('POST /', async function authUser (req, res, params) {
  let credentials = await json(req)
  await db.connect()
  let auth = await db.authenticate(credentials.userName, credentials.password)
  await db.disconnect()

  if (!auth) {
    return send(res, 401, { error: 'invalid credentials' })
  }

  let token = await utils.signToken({
    userName: credentials.userName
  }, config.secret)

  send(res, 200, token)
})

module.exports = async function main (req, res) {
  let { method, url } = req
  let match = hash.get(`${method.toUpperCase()} ${url}`)

  if (match.handler) {
    try {
      await match.handler(req, res, match.params)
    } catch (e) {
      send(res, 500, { error: e.message })
    }
  } else {
    send(res, 404, { error: 'route not found' })
  }
}
