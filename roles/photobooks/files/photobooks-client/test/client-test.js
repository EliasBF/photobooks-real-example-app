'use strict'

const test = require('ava')
const nock = require('nock')
const photobooks = require('../')
const fixtures = require('./fixtures')

let options = {
  endpoints: {
    photos: 'http://photobooks.test/photos',
    albums: 'http://photobooks.test/albums',
    comments: 'http://photobooks.test/comments',
    users: 'http://photobooks.test/users',
    auth: 'http://photobooks.test/auth'
  }
}

test.beforeEach(t => {
  t.context.client = photobooks.createClient(options)
})

test('client', t => {
  const client = t.context.client

  t.is(typeof client.getPhoto, 'function')
  t.is(typeof client.likePhoto, 'function')
  t.is(typeof client.savePhoto, 'function')
  t.is(typeof client.getPhotos, 'function')
  t.is(typeof client.getAlbum, 'function')
  t.is(typeof client.followAlbum, 'function')
  t.is(typeof client.saveAlbum, 'function')
  t.is(typeof client.getPhotosByAlbum, 'function')
  t.is(typeof client.saveComment, 'function')
  t.is(typeof client.getCommentsByPhoto, 'function')
  t.is(typeof client.getUser, 'function')
  t.is(typeof client.saveUser, 'function')
  t.is(typeof client.followUser, 'function')
  t.is(typeof client.getAlbumsByUser, 'function')
  t.is(typeof client.auth, 'function')
})

test('getPhoto', async t => {
  const client = t.context.client

  let token = 'xxx-xxx-xxx'
  let photo = fixtures.getPhoto()

  nock(options.endpoints.photos, {
    reqheaders: {
      'Authorization': `Bearer ${token}`
    }
  })
    .get(`/${photo.publicId}`)
    .reply(200, photo)

  let result = await client.getPhoto(photo.publicId, token)

  t.deepEqual(photo, result)
})

test('savePhoto', async t => {
  const client = t.context.client

  let token = 'xxx-xxx-xxx'
  let photo = fixtures.getPhoto()
  let newPhoto = {
    url: photo.url,
    title: photo.title,
    description: photo.description,
    userId: photo.userId,
    albumId: photo.albumId
  }

  nock(options.endpoints.photos, {
    reqheaders: {
      'Authorization': `Bearer ${token}`
    }
  })
    .post('/', newPhoto)
    .reply(201, photo)

  let result = await client.savePhoto(newPhoto, token)

  t.deepEqual(result, photo)
})

test('getPhotos', async t => {
  const client = t.context.client

  let token = 'xxx-xxx-xxx'
  let photos = fixtures.getPhotos(3)

  nock(options.endpoints.photos, {
    reqheaders: {
      'Authorization': `Bearer ${token}`
    }
  })
    .get('/')
    .reply(200, photos)

  let result = await client.getPhotos(null, token, null)

  t.deepEqual(result, photos)
})

test('getAlbum', async t => {
  const client = t.context.client

  let token = 'xxx-xxx-xxx'
  let album = fixtures.getAlbum()

  nock(options.endpoints.albums, {
    reqheaders: {
      'Authorization': `Bearer ${token}`
    }
  })
    .get(`/${album.name}`)
    .reply(200, album)

  let result = await client.getAlbum(album.name, token)

  t.deepEqual(album, result)
})

test('saveAlbum', async t => {
  const client = t.context.client

  let token = 'xxx-xxx-xxx'
  let album = fixtures.getAlbum()
  let newAlbum = {
    name: album.name,
    title: album.title,
    description: album.description,
    background: album.background,
    userId: album.userId
  }

  nock(options.endpoints.albums, {
    reqheaders: {
      'Authorization': `Bearer ${token}`
    }
  })
    .post('/', newAlbum)
    .reply(201, album)

  let result = await client.saveAlbum(newAlbum, token)

  t.deepEqual(result, album)
})

test('getPhotosByAlbum', async t => {
  const client = t.context.client

  let token = 'xxx-xxx-xxx'
  let photos = fixtures.getPhotos(3)

  nock(options.endpoints.photos, {
    reqheaders: {
      'Authorization': `Bearer ${token}`
    }
  })
    .get(`/album/${photos[0].albumId}/`)
    .reply(200, photos)

  let result = await client.getPhotosByAlbum(photos[0].albumId, null, token)

  t.deepEqual(result, photos)
})

test('saveComment', async t => {
  const client = t.context.client

  let token = 'xxx-xxx-xxx'
  let comment = fixtures.getComment()
  let newComment = {
    userName: comment.userName,
    photoId: comment.photoId,
    content: comment.content
  }

  nock(options.endpoints.comments, {
    reqheaders: {
      'Authorization': `Bearer ${token}`
    }
  })
    .post('/', newComment)
    .reply(201, comment)

  let result = await client.saveComment(newComment, token)

  t.deepEqual(result, comment)
})

test('getCommentsByPhoto', async t => {
  const client = t.context.client

  let token = 'xxx-xxx-xxx'
  let comments = fixtures.getComments(3)

  nock(options.endpoints.comments, {
    reqheaders: {
      'Authorization': `Bearer ${token}`
    }
  })
    .get(`/photo/${comments[0].photoId}/`)
    .reply(200, comments)

  let result = await client.getCommentsByPhoto(comments[0].photoId, null, token)

  t.deepEqual(result, comments)
})

test('getUser', async t => {
  const client = t.context.client

  let token = 'xxx-xxx-xxx'
  let user = fixtures.getUser()

  nock(options.endpoints.users, {
    reqheaders: {
      'Authorization': `Bearer ${token}`
    }
  })
    .get(`/${user.userName}`)
    .reply(200, user)

  let result = await client.getUser(user.userName, token)

  t.deepEqual(result, user)
})

test('saveUser', async t => {
  const client = t.context.client

  let user = fixtures.getUser()
  let newUser = {
    userName: user.userName,
    fullName: user.fullName,
    avatar: user.avatar,
    password: user.password
  }

  nock(options.endpoints.users)
    .post('/', newUser)
    .reply(201)

  let result = await client.saveUser(newUser)

  t.deepEqual(result, undefined)
})

test('getAlbumsByUser', async t => {
  const client = t.context.client

  let token = 'xxx-xxx-xxx'
  let albums = fixtures.getAlbums(3)

  nock(options.endpoints.albums, {
    reqheaders: {
      'Authorization': `Bearer ${token}`
    }
  })
    .get(`/user/${albums[0].userId}/`)
    .reply(200, albums)

  let result = await client.getAlbumsByUser(albums[0].userId, null, token)

  t.deepEqual(result, albums)
})

test('auth', async t => {
  const client = t.context.client

  let credentials = {
    userName: 'photobooks',
    password: 'ph0t0b00ks'
  }

  let token = 'xxx-xxx-xxx'

  nock(options.endpoints.auth)
    .post('/', credentials)
    .reply(200, token)

  let result = await client.auth(credentials.userName, credentials.password)

  t.deepEqual(result, token)
})
