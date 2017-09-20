module.exports = {
  getPhoto () {
    return {
      id: '6a238b19-3ee3-4d5c-acb5-944a3c1fb407',
      publicId: '3ehqEZvwZByc6hjzgEZU5p',
      userId: 'photobooks',
      albumId: 'photos',
      liked: false,
      likes: 0,
      url: 'http://photobooks.test/3ehqEZvwZByc6hjzgEZU5p.jpg',
      title: 'Photo #1',
      description: 'awesome photo',
      createdAt: new Date().toString()
    }
  },

  getPhotos () {
    return [
      this.getPhoto(),
      this.getPhoto(),
      this.getPhoto()
    ]
  },

  getPhotosByAlbum () {
    return [
      this.getPhoto(),
      this.getPhoto()
    ]
  },

  getAlbum () {
    return {
      id: '6a238b19-3ee3-4d5c-acb5-944a3c1fb407',
      publicId: '3ehqEZvwZByc6hjzgEZU5p',
      name: 'awesome-photos-of-2017',
      title: 'Awesome photos of 2017',
      description: 'My awesome photos of 2017',
      background: 'http://photobooks.test/albums/awesome-photos-of-2017.jpg',
      followers: 0,
      userId: 'photobooks',
      createdAt: new Date().toString()
    }
  },

  getAlbumsByUser () {
    return [
      this.getAlbum(),
      this.getAlbum()
    ]
  },

  getComment () {
    return {
      id: '6a238b19-3ee3-4d5c-acb5-944a3c1fb407',
      publicId: '3ehqEZvwZByc6hjzgEZU5p',
      userId: 'photobooks',
      userName: 'photobooks',
      photoId: 'photo',
      content: 'Awesome photo my friend',
      createdAt: new Date().toString()
    }
  },

  getCommentsByPhoto () {
    return [
      this.getComment(),
      this.getComment()
    ]
  },

  getUser () {
    return {
      id: 'f632db90-d6bf-46f0-9fb1-4eb6912cbdb4',
      userName: 'eliasbf',
      fullName: 'Elias Becerra',
      password: '3l14s',
      avatar: 'http://photobooks.test/users/eliasbf.jpg',
      followers: 0,
      following: 0,
      createdAt: new Date().toString()
    }
  }
}
