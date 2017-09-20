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

// crear comentario
hash.set('POST /', async function saveComment (req, res, params, query) {
  try {
    let token = await utils.extractToken(req)
    await utils.verifyToken(token, config.secret, {})
  } catch (e) {
    return send(res, 401, { error: 'invalid token' })
  }

  let comment = await json(req)
  await db.connect()
  let created = null

  if ('view' in query) {
    created = await db.saveCommentForView(comment)
  } else {
    created = await db.saveComment(comment)
  }

  await db.disconnect()
  send(res, 201, created)
})

// todos los comentarios de una foto
hash.set('GET /photo/:id', async function getCommentsByPhoto (req, res, params, query) {
  try {
    let token = await utils.extractToken(req)
    await utils.verifyToken(token, config.secret, {})
  } catch (e) {
    return send(res, 401, { error: 'invalid token' })
  }

  await db.connect()
  let comments

  if ('view' in query) {
    comments = await db.getCommentsForView({from: 'from' in query ? query.from : null, photoId: params.id})
  } else {
    comments = await db.getCommentsByPhoto(params.id, 'from' in query ? query.from : null)
  }

  await db.disconnect()

  send(res, 200, comments)
})

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
