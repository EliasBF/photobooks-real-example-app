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

// todas las fotos
hash.set('GET /', async function getAll (req, res, params, query) {
  try {
    let token = await utils.extractToken(req)
    await utils.verifyToken(token, config.secret, {})
  } catch (e) {
    return send(res, 401, { error: 'invalid token' })
  }

  await db.connect()
  let photos

  if ('view' in query) {
    photos = await db.getPhotosForView({from: 'from' in query ? query.from : null})
  } else {
    photos = await db.getPhotos('from' in query ? query.from : null)
  }

  await db.disconnect()
  send(res, 200, photos)
})

// foto por publicId
hash.set('GET /:id', async function getPhoto (req, res, params, query) {
  try {
    let token = await utils.extractToken(req)
    await utils.verifyToken(token, config.secret, {})
  } catch (e) {
    return send(res, 401, { error: 'invalid token' })
  }

  await db.connect()
  let photo

  if ('view' in query) {
    photo = await db.getPhotoForView({photoId: params.id})
  } else {
    photo = await db.getPhoto(params.id)
  }

  await db.disconnect()
  send(res, 200, photo)
})

// todas las fotos de un album
hash.set('GET /album/:id', async function getPhotosByAlbum (req, res, params, query) {
  try {
    let token = await utils.extractToken(req)
    await utils.verifyToken(token, config.secret, {})
  } catch (e) {
    return send(res, 401, { error: 'invalid token' })
  }

  await db.connect()
  let photos

  if ('view' in query) {
    photos = await db.getPhotosForView({from: 'from' in query ? query.from : null, index: 'albumId', indexValue: params.id})
  } else {
    photos = await db.getPhotosByAlbum(params.id, 'from' in query ? query.from : null)
  }

  await db.disconnect()
  send(res, 200, photos)
})

// crear foto
hash.set('POST /', async function newPhoto (req, res, params, query) {
  try {
    let token = await utils.extractToken(req)
    await utils.verifyToken(token, config.secret, {})
  } catch (e) {
    return send(res, 401, { error: 'invalid token' })
  }

  let photo = await json(req)

  await db.connect()
  let created = null

  if ('view' in query) {
    created = await db.savePhotoForView(photo)
  } else {
    created = await db.savePhoto(photo)
  }

  await db.disconnect()
  send(res, 201, created)
})

// TODO: hash.set('POST /:id/like', async function likePhoto (req, res, params, query) {}

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
