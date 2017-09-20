'use strict'

const config = {
  client: {
    endpoints: {
      photos: 'http://api.photobooks.com/photos',
      albums: 'http://api.photobooks.com/albums',
      comments: 'http://api.photobooks.com/comments',
      users: 'http://api.photobooks.com/users',
      auth: 'http://api.photobooks.com/auth'
    }
  },
  secret: process.env.PHOTOBOOKS_SECRET || 'ph0t0b00ks'
}

if (process.env.NODE_ENV !== 'production') {
  config.client.endpoints = {
    photos: 'http://localhost:5000',
    albums: 'http://localhost:5001',
    comments: 'http://localhost:5002',
    users: 'http://localhost:5003',
    auth: 'http://localhost:5004'
  }
}

module.exports = config
