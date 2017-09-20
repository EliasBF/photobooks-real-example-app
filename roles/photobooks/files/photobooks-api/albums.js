'use strict'

const urlParse = require('url').parse
const queryParse = require('qs').parse

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

// album por name
hash.set('GET /:name', async function getAlbum (req, res, params, query) {
  try {
    let token = await utils.extractToken(req)
    await utils.verifyToken(token, config.secret, {})
  } catch (e) {
    return send(res, 401, { error: 'invalid token' })
  }

  await db.connect()
  let album

  if ('view' in query) {
    album = await db.getAlbumForView({albumName: params.name})
  } else {
    album = await db.getAlbum(params.name)
  }

  await db.disconnect()
  send(res, 200, album)
})

// albumes por usuario
hash.set('GET /user/:id', async function getAlbumsByUser (req, res, params, query) {
  try {
    let token = await utils.extractToken(req)
    await utils.verifyToken(token, config.secret, {})
  } catch (e) {
    return send(res, 401, { error: 'invalid token' })
  }

  await db.connect()
  let albums

  if ('view' in query) {
    albums = await db.getAlbumsForView({from: 'from' in query ? Number(query.from) : null, indexValue: params.id, index: 'userId'})
  } else {
    albums = await db.getAlbumsByUser(params.id, 'from' in query ? Number(query.from) : null)
  }

  await db.disconnect()
  send(res, 200, albums)
})

// crear album
hash.set('POST /', async function newAlbum (req, res, params, query) {
  try {
    let token = await utils.extractToken(req)
    await utils.verifyToken(token, config.secret, {})
  } catch (e) {
    return send(res, 401, { error: 'invalid token' })
  }

  let album = await json(req)

  await db.connect()
  let created = null

  if ('view' in query) {
    created = await db.saveAlbumForView(album)
  } else {
    created = await db.saveAlbum(album)
  }

  await db.disconnect()
  send(res, 201, created)
})

// TODO: hash.set('POST /:id/follow', async function likePhoto (req, res, params, query) {}

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
