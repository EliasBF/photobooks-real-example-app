'use  strict'

const test = require('ava')
const uuid = require('uuid-base62')
const r = require('rethinkdb')
const Db = require('../')
const utils = require('../lib/utils')
const fixtures = require('./fixtures')

test.beforeEach('setup database', async t => {
  const dbName = `photobooks_${uuid.v4()}`
  const db = new Db({ db: dbName, setup: true })

  await db.connect()

  /*
    TODO: Generar metodo en lib/utils para generar datos para tests
    TODO: Añadir tests para metodos provisionales que retornan datos
          para las vistas
  */

  t.context.db = db
  t.context.dbName = dbName

  t.true(db.connected, 'should be connected')
})

test.afterEach.always('cleanup database', async t => {
  let db = t.context.db
  let dbName = t.context.dbName

  await db.disconnect()
  t.false(db.connected, 'should be disconnected')

  let conn = await r.connect({})
  await r.dbDrop(dbName).run(conn)
})

test('save photo', async t => {
  let db = t.context.db
  t.is(typeof db.savePhoto, 'function', 'savePhoto is a function')

  let photo = fixtures.getPhoto()
  let created = await db.savePhoto(photo)

  t.is(typeof created.publicId, 'string')
  t.is(created.url, photo.url)
  t.is(created.title, photo.title)
  t.is(created.description, photo.description)
  t.is(created.likes, photo.likes)
  t.is(created.liked, photo.liked)
  t.is(created.userId, photo.userId)
  t.is(created.albumId, photo.albumId)
  t.truthy(created.createdAt)
})

test('save album', async t => {
  let db = t.context.db
  t.is(typeof db.saveAlbum, 'function', 'saveAlbum is a function')

  let album = fixtures.getAlbum()
  let created = await db.saveAlbum(album)

  t.is(typeof created.publicId, 'string')
  t.is(created.name, album.name)
  t.is(created.title, album.title)
  t.is(created.description, album.description)
  t.is(created.background, album.background)
  t.is(created.followers, album.followers)
  t.is(created.userId, album.userId)
  t.truthy(created.createdAt)
})

test('save comment', async t => {
  let db = t.context.db
  t.is(typeof db.saveComment, 'function', 'saveComment is a function')

  let comment = fixtures.getComment()
  let created = await db.saveComment(comment)

  t.is(typeof created.publicId, 'string')
  t.is(created.userName, comment.userName)
  t.is(created.content, comment.content)
  t.is(created.photoId, comment.photoId)
  t.truthy(created.createdAt)
})

test('save user', async t => {
  let db = t.context.db
  t.is(typeof db.saveUser, 'function', 'saveUser is a function')

  let user = fixtures.getUser()
  let plainPassword = user.password
  let created = await db.saveUser(user)

  t.is(typeof created.publicId, 'string')
  t.is(created.userName, user.userName)
  t.is(created.fullName, user.fullName)
  t.is(created.avatar, user.avatar)
  t.is(created.followers, user.followers)
  t.is(created.following, user.following)
  t.is(created.password, utils.encrypt(plainPassword))
  t.truthy(created.createdAt)
})

test('get photo', async t => {
  let db = t.context.db
  t.is(typeof db.getPhoto, 'function', 'getPhoto is a function')

  let photo = fixtures.getPhoto()
  let created = await db.savePhoto(photo)
  let result = await db.getPhoto(created.publicId)

  t.deepEqual(created, result)
  await t.throws(db.getPhoto('foo'), /not found/)
})

test('get album', async t => {
  let db = t.context.db
  t.is(typeof db.getAlbum, 'function', 'getAlbum is a function')

  let album = fixtures.getAlbum()
  let created = await db.saveAlbum(album)
  let result = await db.getAlbum(created.name)

  t.deepEqual(created, result)
  await t.throws(db.getAlbum('foo'), /not found/)
})

test('get user', async t => {
  let db = t.context.db
  t.is(typeof db.getUser, 'function', 'getUser is a function')

  let user = fixtures.getUser()
  let created = await db.saveUser(user)
  let result = await db.getUser(created.userName)

  t.deepEqual(created, result)
  await t.throws(db.getUser('foo'), /not found/)
})

test('list photos', async t => {
  let db = t.context.db
  t.is(typeof db.getPhotos, 'function', 'getPhotos is a function')

  let photos = fixtures.getPhotos(25)
  let savePhotos = photos.map(photo => db.savePhoto(photo))
  let created = await Promise.all(savePhotos)

  let result1 = await db.getPhotos()
  let result2 = await db.getPhotos(12)
  let result3 = await db.getPhotos(24)

  t.is(created.length, result1.length + result2.length + result3.length)
  t.is(result1.length, 12)
  t.is(result2.length, 12)
  t.is(result3.length, 1)
})

test('list photos by album', async t => {
  let db = t.context.db
  t.is(typeof db.getPhotosByAlbum, 'function', 'getPhotosByAlbum is a function')

  let photos = fixtures.getPhotos(25)
  let savePhotos = photos.map(photo => db.savePhoto(photo))
  let created = await Promise.all(savePhotos)

  let result1 = await db.getPhotosByAlbum(created[0].albumId)
  let result2 = await db.getPhotosByAlbum(created[0].albumId, 12)
  let result3 = await db.getPhotosByAlbum(created[0].albumId, 24)

  t.is(1, result1.length + result2.length + result3.length)
  t.is(result1.length, 1)
  t.is(result2.length, 0)
  t.is(result3.length, 0)
})

test('list albums by user', async t => {
  let db = t.context.db
  t.is(typeof db.getAlbumsByUser, 'function', 'getAlbumsByUser is a function')

  let albums = fixtures.getAlbums(25)
  let saveAlbums = albums.map(album => db.saveAlbum(album))
  let created = await Promise.all(saveAlbums)

  let result1 = await db.getAlbumsByUser(created[0].userId)
  let result2 = await db.getAlbumsByUser(created[0].userId, 12)
  let result3 = await db.getAlbumsByUser(created[0].userId, 24)

  t.is(1, result1.length + result2.length + result3.length)
  t.is(result1.length, 1)
  t.is(result2.length, 0)
  t.is(result3.length, 0)
})

test('list comments by photo', async t => {
  let db = t.context.db
  t.is(typeof db.getCommentsByPhoto, 'function', 'getCommentsByPhoto is a function')

  let comments = fixtures.getComments(25)
  let saveComments = comments.map(comment => db.saveComment(comment))
  let created = await Promise.all(saveComments)

  let result1 = await db.getCommentsByPhoto(created[0].photoId)
  let result2 = await db.getCommentsByPhoto(created[0].photoId, 12)
  let result3 = await db.getCommentsByPhoto(created[0].photoId, 24)

  t.is(1, result1.length + result2.length + result3.length)
  t.is(result1.length, 1)
  t.is(result2.length, 0)
  t.is(result3.length, 0)
})

test('authenticate user', async t => {
  let db = t.context.db
  t.is(typeof db.authenticate, 'function', 'authenticate is a function')

  let user = fixtures.getUser()
  let plainPassword = user.password
  await db.saveUser(user)

  let success = await db.authenticate(user.userName, plainPassword)
  t.true(success)

  let fail = await db.authenticate(user.username, 'foo')
  t.false(fail)

  let failure = await db.authenticate('foo', 'bar')
  t.false(failure)
})
