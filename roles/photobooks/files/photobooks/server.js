const path = require('path')
const express = require('express')
const multer = require('multer')
const ext = require('file-extension')
const bodyParser = require('body-parser')
const passport = require('passport')
const photobooks = require('photobooks-client')
const auth = require('./auth')

const config = require('./config')
const port = process.env.PORT || 5050

const client = photobooks.createClient(config.client)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'upload'))
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}.${ext(file.originalname)}`)
  }
})

const upload = multer({ storage: storage }).single('photo')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(passport.initialize())
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'upload')))

passport.use(auth.jwtStrategy)

// alias para autenticar rutas
function authenticate () {
  return passport.authenticate('jwt', { session: false })
}

app.get([
  '/',
  '/signin',
  '/signup',
  '/profile/:username',
  '/:username/album/:name',
  '/:username/photo/:id'
], (req, res) => {
  res.render('index')
})

// TODO: Separar endpoints en diferentes routers y archivos

app.post('/signup', (req, res) => {
  // body:
  // {userName, fullName, password}
  client.saveUser(req.body, (err, user) => {
    if (err) {
      return res.status(500).send(err.message)
    }

    // redirección desde el cliente
    res.end()
  })
})

app.post('/signin', (req, res) => {
  client.auth(req.body.userName, req.body.password, (err, token) => {
    if (err) {
      return res.status(401).send('username and password not found')
    }

    client.getUser(req.body.userName, token, false, (err, user) => {
      if (err) {
        return res.status(500).send(`An error ocurred: ${err.message}`)
      }

      res.send({
        data: {
          user: user,
          token: token
        }
      })
    })
  })
})

app.get('/api/photos', authenticate(), (req, res) => {
  let query = req.query

  client.getPhotos(
    'from' in query ? Number(query.from) : null,
    req.token,
    (err, photos) => {
      if (err) {
        return res.send({
          data: {
            photos: [],
            next: false
          }
        })
      }

      // si next: aun quedan fotos por cargar
      res.send({
        data: {
          photos: photos,
          next: photos.length === 12
        }
      })
    }
  )
})

app.get('/api/photos/album/:id', authenticate(), (req, res) => {
  let query = req.query

  client.getPhotosByAlbum(
    req.params.id,
    'from' in query ? Number(query.from) : null,
    req.token,
    (err, photos) => {
      if (err) {
        return res.send({
          data: {
            photos: [],
            next: false
          }
        })
      }

      res.send({
        data: {
          photos: photos,
          next: photos.length === 12
        }
      })
    }
  )
})

app.get('/api/comments/photo/:id', authenticate(), (req, res) => {
  let query = req.query

  client.getCommentsByPhoto(
    req.params.id,
    'from' in query ? Number(query.from) : null,
    req.token,
    (err, comments) => {
      if (err) {
        return res.send({
          data: {
            comments: [],
            next: false
          }
        })
      }

      res.send({
        data: {
          comments: comments,
          next: comments === 12
        }
      })
    }
  )
})

app.get('/api/albums/user/:id', authenticate(), (req, res) => {
  let query = req.query

  client.getAlbumsByUser(
    req.params.id,
    'from' in query ? Number(query.from) : null,
    req.token,
    (err, albums) => {
      if (err) {
        return res.send({
          data: {
            albums: [],
            next: false
          }
        })
      }

      res.send({
        data: {
          albums: albums,
          next: albums.length === 12
        }
      })
    }
  )
})

app.get('/api/photos/:id', authenticate(), (req, res) => {
  client.getPhoto(
    req.params.id,
    req.token,
    (err, photo) => {
      if (err) {
        return res.status(404).send({ error: 'photo not found' })
      }

      res.send({
        data: {
          photo: photo
        }
      })
    }
  )
})

app.get('/api/albums/:name', authenticate(), (req, res) => {
  client.getAlbum(
    req.params.name,
    req.token,
    (err, album) => {
      if (err) {
        return res.status(404).send({ error: 'album not found' })
      }

      res.send({
        data: {
          album: album
        }
      })
    }
  )
})

app.get('/api/users/:userName', authenticate(), (req, res) => {
  let query = req.query

  client.getUser(
    req.params.userName,
    req.token,
    'view' in query || false,
    (err, user) => {
      if (err) {
        return res.status(404).send({ error: 'user not found' })
      }

      res.send({
        data: {
          user: user
        }
      })
    }
  )
})

app.post('/api/photos/:id/like', authenticate(), (req, res) => {
  client.likePhoto(
    req.params.id,
    req.token,
    req.body,
    (err, photo) => {
      if (err) {
        return res.status(404).send({ error: 'photo not found' })
      }

      res.send({
        data: {
          photo: photo
        }
      })
    }
  )
})

app.post('/api/albums/:id/follow', authenticate(), (req, res) => {
  client.followAlbum(
    req.params.id,
    req.token,
    req.body,
    (err, album) => {
      if (err) {
        return res.status(404).send({ error: 'album not found' })
      }

      res.send({
        data: {
          album: album
        }
      })
    }
  )
})

app.post('/api/users/:id/follow', authenticate(), (req, res) => {
  client.followUser(
    [req.body.followerId, req.params.id],
    req.token,
    req.body,
    (err, users) => {
      if (err) {
        return res.send({
          data: {
            users: []
          }
        })
      }

      res.send({
        data: {
          user: users[1],
          follower: users[0]
        }
      })
    }
  )
})

app.post('/api/photos', authenticate(), (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).send(`Error uploading file: ${err.message}`)
    }

    let photo = req.body
    photo.url = req.file.filename

    client.savePhoto(
      photo,
      req.token,
      (err, created) => {
        if (err) {
          return res.status(500).send(err.message)
        }

        res.send({
          data: {
            photo: created
          }
        })
      }
    )
  })
})

app.post('/api/albums', authenticate(), (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).send(`Error uploading file: ${err.message}`)
    }

    let album = req.body
    album.background = req.file.filename

    client.saveAlbum(
      album,
      req.token,
      (err, created) => {
        if (err) {
          return res.status(500).send(err.message)
        }

        res.send({
          data: {
            album: created
          }
        })
      }
    )
  })
})

app.post('/api/comments', authenticate(), (req, res) => {
  client.saveComment(
    req.body,
    req.token,
    (err, comment) => {
      if (err) {
        return res.status(500).send(err.message)
      }

      res.send({
        data: {
          comment: comment
        }
      })
    }
  )
})

app.listen(port, (err) => {
  if (err) {
    console.log(err)
    process.exit(1)
  }

  console.log(`Photobooks running in http://localhost:${port}`)
})
