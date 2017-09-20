'use strict'

import test from 'ava'
import micro from 'micro'
import listen from 'test-listen'
import request from 'request-promise'
import fixtures from './fixtures/'
import comments from '../comments'
import utils from '../lib/utils'
import config from '../config'

test.beforeEach(async t => {
  let srv = micro(comments)
  t.context.url = await listen(srv)
})

test('GET /photo/:id', async t => {
  let comments = fixtures.getCommentsByPhoto()
  let userName = fixtures.getUser().userName
  let url = t.context.url
  let token = await utils.signToken({ userName: userName }, config.secret)

  let body = await request({ uri: `${url}/photo/${comments[0].id}`, json: true, headers: { 'Authorization': `Bearer ${token}` } })
  t.deepEqual(body, comments)
})

test('POST /', async t => {
  let comment = fixtures.getComment()
  let userName = fixtures.getUser().userName
  let url = t.context.url
  let token = await utils.signToken({ userName: userName }, config.secret)

  let options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      userId: comment.userId,
      userName: comment.userName,
      photoId: comment.photoId,
      content: comment.content
    },
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }

  let response = await request(options)

  t.is(response.statusCode, 201)
  t.deepEqual(response.body, comment)
})
