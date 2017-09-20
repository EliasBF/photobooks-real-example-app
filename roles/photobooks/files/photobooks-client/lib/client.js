'use strict'

const request = require('request-promise')
const Promise = require('bluebird')

class Client {
  constructor (options) {
    this.options = options || {
      endpoints: {
        photos: 'http://api.photobooks.com/photos',
        albums: 'http://api.photobooks.com/albums',
        comments: 'http://api.photobooks.com/comments',
        users: 'http://api.photobooks.com/users',
        auth: 'http://api.photobooks.com/auth'
      }
    }
  }

  apiCalls (method, url, body, token, callback) {
    let opts = {
      method: method,
      uri: url,
      json: true
    }

    if (body) {
      opts['body'] = body
    }

    if (token) {
      opts['headers'] = {
        'Authorization': `Bearer ${token}`
      }
    }

    return Promise.resolve(request(opts)).asCallback(callback)
  }

  getPhoto (photoId, token, callback) {
    return this.apiCalls(
      'GET',
      `${this.options.endpoints.photos}/${photoId}?view=true`,
      null,
      token,
      callback
    )
  }

  // TODO: likePhoto (photoId, changes, token, callback) {}

  savePhoto (photo, token, callback) {
    return this.apiCalls(
      'POST',
      `${this.options.endpoints.photos}/?view=true`,
      photo,
      token,
      callback
    )
  }

  getPhotos (from, token, callback) {
    return this.apiCalls(
      'GET',
      `${this.options.endpoints.photos}${from ? '?from=' + String(from) + '&view=true' : '?view=true'}`,
      null,
      token,
      callback
    )
  }

  getAlbum (name, token, callback) {
    return this.apiCalls(
      'GET',
      `${this.options.endpoints.albums}/${name}?view=true`,
      null,
      token,
      callback
    )
  }

  // TODO: followAlbum (albumId, changes, token, callback) {}

  saveAlbum (album, token, callback) {
    return this.apiCalls(
      'POST',
      `${this.options.endpoints.albums}/?view=true`,
      album,
      token,
      callback
    )
  }

  getPhotosByAlbum (albumId, from, token, callback) {
    return this.apiCalls(
      'GET',
      `${this.options.endpoints.photos}/album/${albumId}${from ? '?from=' + String(from) + '&view=true' : '?view=true'}`,
      null,
      token,
      callback
    )
  }

  saveComment (comment, token, callback) {
    return this.apiCalls(
      'POST',
      `${this.options.endpoints.comments}/?view=true`,
      comment,
      token,
      callback
    )
  }

  getCommentsByPhoto (photoId, from, token, callback) {
    return this.apiCalls(
      'GET',
      `${this.options.endpoints.comments}/photo/${photoId}${from ? '?from=' + String(from) + '&view=true' : '?view=true'}`,
      null,
      token,
      callback
    )
  }

  getUser (userName, token, view, callback) {
    return this.apiCalls(
      'GET',
      `${this.options.endpoints.users}/${userName}${view ? '?view=true' : ''}`,
      null,
      token,
      callback
    )
  }

  saveUser (user, callback) {
    return this.apiCalls(
      'POST',
      `${this.options.endpoints.users}/`,
      user,
      null,
      callback
    )
  }

  // TODO: followUser (id, changes, token, callback) {}

  getAlbumsByUser (userId, from, token, callback) {
    return this.apiCalls(
      'GET',
      `${this.options.endpoints.albums}/user/${userId}${from ? '?from=' + String(from) + '&view=true' : '?view=true'}`,
      null,
      token,
      callback
    )
  }

  auth (userName, password, callback) {
    return this.apiCalls(
      'POST',
      `${this.options.endpoints.auth}/`,
      { userName, password },
      null,
      callback
    )
  }
}

module.exports = Client
