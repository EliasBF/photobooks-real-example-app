'use strict'

const uuid = require('uuid-base62')

const fixtures = {
  getPhoto () {
    return {
      url: '/photos/1.jpg',
      title: 'Photo #1',
      description: 'Awesome photo',
      likes: 4,
      liked: false,
      userId: uuid.uuid(),
      albumId: uuid.uuid()
    }
  },
  getPhotos (n) {
    let photos = []
    while (n-- > 0) {
      photos.push(this.getPhoto())
    }

    return photos
  },
  getUser () {
    return {
      userName: 'photobooks',
      fullName: 'Photobooks App',
      avatar: '/users/photobooks.jpg',
      followers: 6,
      following: 124,
      password: uuid.uuid()
    }
  },
  getComment () {
    return {
      userName: 'photobooks',
      photoId: uuid.uuid(),
      content: 'Awesome photo my friend'
    }
  },
  getComments (n) {
    let comments = []
    while (n-- > 0) {
      comments.push(this.getComment())
    }

    return comments
  },
  getAlbum () {
    return {
      name: 'awesome-photos-of-2017',
      title: 'Awesome photos of 2017',
      description: 'My awesome photos of 2017',
      background: '/albums/awesome-photos-of-2017.jpg',
      followers: 34,
      userId: uuid.uuid()
    }
  },
  getAlbums (n) {
    let albums = []
    while (n-- > 0) {
      albums.push(this.getAlbum())
    }

    return albums
  }
}

module.exports = fixtures
