'use strict'

const uuid = require('uuid-base62')

const fixtures = {
  getPhoto () {
    let id = uuid.uuid()
    return {
      id: id,
      publicId: uuid.encode(id),
      url: '/photos/1.jpg',
      title: 'Photo #1',
      description: 'Awesome photo',
      likes: 0,
      liked: false,
      userId: uuid.uuid(),
      albumId: uuid.uuid(),
      createdAt: new Date().toString()
    }
  },
  getPhotos (n) {
    let photos = []
    while (n-- > 0) {
      photos.push(this.getPhoto())
    }

    return photos
  },
  getAlbum () {
    let id = uuid.uuid()
    return {
      id: id,
      publicId: uuid.encode(id),
      name: 'awesome-photos-of-2017',
      title: 'Awesome photos of 2017',
      description: 'My awesome photos of 2017',
      background: '/albums/awesome-photos-of-2017.jpg',
      followers: 0,
      userId: uuid.uuid(),
      createdAt: new Date().toString()
    }
  },
  getAlbums (n) {
    let albums = []
    while (n-- > 0) {
      albums.push(this.getAlbum())
    }

    return albums
  },
  getComment () {
    let id = uuid.uuid()
    return {
      id: id,
      publicId: uuid.encode(id),
      userName: 'photobooks',
      photoId: uuid.uuid(),
      content: 'Awesome photo my friend',
      createdAt: new Date().toString()
    }
  },
  getComments (n) {
    let comments = []
    while (n-- > 0) {
      comments.push(this.getComment())
    }

    return comments
  },
  getUser () {
    let id = uuid.uuid()
    return {
      id: id,
      publicId: uuid.encode(id),
      userName: 'photobooks',
      fullName: 'Photobooks App',
      avatar: '/users/photobooks.jpg',
      followers: 0,
      following: 0,
      password: uuid.uuid(),
      createdAt: new Date().toString()
    }
  }
}

module.exports = fixtures
