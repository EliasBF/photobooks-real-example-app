'use strict'

import test from 'ava'
import micro from 'micro'
import listen from 'test-listen'
import request from 'request-promise'
import fixtures from './fixtures/'
import albums from '../albums'
import utils from '../lib/utils'
import config from '../config'

test.beforeEach(async t => {
  let srv = micro(albums)
  t.context.url = await listen(srv)
})

test('GET /:id', async t => {
  let album = fixtures.getAlbum()
  let userName = fixtures.getUser().userName
  let url = t.context.url
  let token = await utils.signToken({ userName: userName }, config.secret)

  let body = await request({ uri: `${url}/${album.id}`, json: true, headers: { 'Authorization': `Bearer ${token}` } })
  t.deepEqual(body, album)
})

test('no token', async t => {
  let album = fixtures.getAlbum()
  let url = t.context.url

  let options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      title: album.title,
      description: album.description,
      userId: album.userId,
      name: album.name,
      background: album.background
    },
    resolveWithFullResponse: true
  }

  await t.throws(request(options), /invalid token/)
})

test('invalid token', async t => {
  let album = fixtures.getAlbum()
  let url = t.context.url
  let token = await utils.signToken({ userName: 'hacky' }, 'hacky')

  let options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      title: album.title,
      description: album.description,
      userId: album.userId,
      name: album.name,
      background: album.background
    },
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }

  await t.throws(request(options), /invalid token/)
})

test('POST /', async t => {
  let album = fixtures.getAlbum()
  let userName = fixtures.getUser().userName
  let url = t.context.url
  let token = await utils.signToken({ userName: userName }, config.secret)

  let options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      title: album.title,
      description: album.description,
      userId: album.userId,
      name: album.name,
      background: album.background
    },
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }

  let response = await request(options)

  t.is(response.statusCode, 201)
  t.deepEqual(response.body, album)
})

test('GET /user/:id', async t => {
  let albums = fixtures.getAlbumsByUser()
  let userName = fixtures.getUser().userName
  let url = t.context.url
  let token = await utils.signToken({ userName: userName }, config.secret)

  let options = {
    method: 'GET',
    uri: `${url}/user/${albums[0].userId}`,
    json: true,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }

  let body = await request(options)

  t.deepEqual(body, albums)
})
