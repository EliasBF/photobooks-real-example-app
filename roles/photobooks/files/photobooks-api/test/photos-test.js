'use strict'

import test from 'ava'
import micro from 'micro'
import listen from 'test-listen'
import request from 'request-promise'
import fixtures from './fixtures/'
import photos from '../photos'
import utils from '../lib/utils'
import config from '../config'

test.beforeEach(async t => {
  let srv = micro(photos)
  t.context.url = await listen(srv)
})

test('GET /:id', async t => {
  let photo = fixtures.getPhoto()
  let userName = fixtures.getUser().userName
  let url = t.context.url
  let token = await utils.signToken({ userName: userName }, config.secret)

  let body = await request({ uri: `${url}/${photo.id}`, json: true, headers: { 'Authorization': `Bearer ${token}` } })
  t.deepEqual(body, photo)
})

test('no token', async t => {
  let photo = fixtures.getPhoto()
  let url = t.context.url

  let options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      title: photo.title,
      description: photo.description,
      url: photo.url,
      userId: photo.userId
    },
    resolveWithFullResponse: true
  }

  await t.throws(request(options), /invalid token/)
})

test('invalid token', async t => {
  let photo = fixtures.getPhoto()
  let url = t.context.url
  let token = await utils.signToken({ userName: 'hacky' }, 'hacky')

  let options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      title: photo.title,
      description: photo.description,
      url: photo.url,
      userId: photo.userId
    },
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }

  await t.throws(request(options), /invalid token/)
})

test('POST /', async t => {
  let photo = fixtures.getPhoto()
  let userName = fixtures.getUser().userName
  let url = t.context.url
  let token = await utils.signToken({ userName: userName }, config.secret)

  let options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      title: photo.title,
      description: photo.description,
      url: photo.url,
      userId: photo.userId
    },
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }

  let response = await request(options)

  t.is(response.statusCode, 201)
  t.deepEqual(response.body, photo)
})

test('GET /', async t => {
  let photos = fixtures.getPhotos()
  let userName = fixtures.getUser().userName
  let url = t.context.url
  let token = await utils.signToken({ userName: userName }, config.secret)

  let options = {
    method: 'GET',
    uri: `${url}/`,
    json: true,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }

  let body = await request(options)

  t.deepEqual(body, photos)
})
