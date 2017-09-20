'use strict'

const fixtures = require('../fixtures/')

module.exports = class Db {
  connect () {
    return Promise.resolve(true)
  }

  disconnect () {
    return Promise.resolve(true)
  }

  getPhoto (id) {
    return Promise.resolve(fixtures.getPhoto())
  }

  getAlbum (id) {
    return Promise.resolve(fixtures.getAlbum())
  }

  getUser (id) {
    return Promise.resolve(fixtures.getUser())
  }

  savePhoto (photo) {
    return Promise.resolve(fixtures.getPhoto())
  }

  saveAlbum (album) {
    return Promise.resolve(fixtures.getAlbum())
  }

  saveUser (user) {
    return Promise.resolve(fixtures.getUser())
  }

  saveComment (comment) {
    return Promise.resolve(fixtures.getComment())
  }

  likePhoto (id) {
    let photo = fixtures.getPhoto()
    photo.liked = true
    photo.likes = 1
    return Promise.resolve(photo)
  }

  followAlbum (id) {
    let album = fixtures.getAlbum()
    album.followers = 1
    return Promise.resolve(album)
  }

  followUser (ids) {
    let user = fixtures.getUser()
    let user2 = fixtures.getUser()
    user.following = 1
    user2.followers = 1
    return Promise.resolve([user, user2])
  }

  getPhotos () {
    return Promise.resolve(fixtures.getPhotos())
  }

  getPhotosByAlbum (id) {
    return Promise.resolve(fixtures.getPhotosByAlbum())
  }

  getAlbumsByUser (id) {
    return Promise.resolve(fixtures.getAlbumsByUser())
  }

  getCommentsByPhoto (id) {
    return Promise.resolve(fixtures.getCommentsByPhoto())
  }

  authenticate (userName, password, callback) {
    return Promise.resolve(true)
  }
}
