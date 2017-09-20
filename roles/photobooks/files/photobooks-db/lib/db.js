'use strict'

const co = require('co')
const r = require('rethinkdb')
const Promise = require('bluebird')
const uuid = require('uuid-base62')
const utils = require('./utils')
const config = require('../config')

const defaults = config.db

/*
  TODO: Ajustar metodos para que retornen los datos necesarios para las
        vistas si se pasa el flag view.
  TODO: Eliminar metodos provisionales para retornan datos necesarios
        para las vistas
  TODO: Utilizar Joins para generar los datos de las vistas
  TODO: Añadir funcionalidad para seguir usuarios, albumes y guardar
        fotos por usuario
*/

class Db {
  constructor (opts) {
    opts = opts || {}
    this.host = opts.host || defaults.host
    this.port = opts.port || defaults.port
    this.db = opts.db || defaults.db
    this.connected = false
    this.setup = opts.setup || false
  }

  connect (callback) {
    this.connection = r.connect({
      host: this.host,
      port: this.port
    })

    this.connected = true

    let db = this.db
    let connection = this.connection

    if (!this.setup) {
      return Promise.resolve(connection).asCallback(callback)
    }

    let setup = co.wrap(function * () {
      let conn = yield connection

      let dbList = yield r.dbList().run(conn)
      if (dbList.indexOf(db) === -1) {
        yield r.dbCreate(db).run(conn)
      }

      let dbTables = yield r.db(db).tableList().run(conn)
      if (dbTables.indexOf('photos') === -1) {
        yield r.db(db).tableCreate('photos', { primaryKey: 'publicId' }).run(conn)
        yield r.db(db).table('photos').indexCreate('albumId').run(conn)
        yield r.db(db).table('photos').indexCreate('createdAt').run(conn)
      }

      if (dbTables.indexOf('albums') === -1) {
        yield r.db(db).tableCreate('albums', { primaryKey: 'publicId' }).run(conn)
        yield r.db(db).table('albums').indexCreate('name').run(conn)
        yield r.db(db).table('albums').indexCreate('userId').run(conn)
        yield r.db(db).table('albums').indexCreate('createdAt').run(conn)
      }

      if (dbTables.indexOf('comments') === -1) {
        yield r.db(db).tableCreate('comments', { primaryKey: 'publicId' }).run(conn)
        yield r.db(db).table('comments').indexCreate('photoId').run(conn)
        yield r.db(db).table('comments').indexCreate('createdAt').run(conn)
      }

      if (dbTables.indexOf('users') === -1) {
        yield r.db(db).tableCreate('users', { primaryKey: 'publicId' }).run(conn)
        yield r.db(db).table('users').indexCreate('userName').run(conn)
      }

      return conn
    })

    return Promise.resolve(setup()).asCallback(callback)
  }

  disconnect (callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    this.connected = false
    return Promise.resolve(this.connection)
      .then((conn) => conn.close())
  }

  getPhoto (id, callback) {
    return this.get('photos', id, callback)
  }

  getAlbum (id, callback) {
    return this.get('albums', id, callback)
  }

  getUser (userName, callback) {
    return this.get('users', userName, callback)
  }

  savePhoto (photo, callback) {
    return this.save('photos', photo, callback)
  }

  saveAlbum (album, callback) {
    return this.save('albums', album, callback)
  }

  saveUser (user, callback) {
    return this.save('users', user, callback)
  }

  saveComment (comment, callback) {
    return this.save('comments', comment, callback)
  }

  likePhoto (id, changes, callback) {
    return this.likeOrFollow('photos', id, changes, callback)
  }

  followAlbum (id, changes, callback) {
    return this.likeOrFollow('albums', id, changes, callback)
  }

  followUser (userIds, changes, callback) {
    return this.likeOrFollow('users', userIds, changes, callback)
  }

  getPhotos (from, callback) {
    return this.getAll({
      table: 'photos', from: from || null, index: null, indexValue: null
    }, callback)
  }

  getPhotosByAlbum (albumId, from, callback) {
    return this.getAll({
      table: 'photos', from: from || null, index: 'albumId', indexValue: albumId
    }, callback)
  }

  getAlbumsByUser (userId, from, callback) {
    return this.getAll({
      table: 'albums', from: from || null, index: 'userId', indexValue: userId
    }, callback)
  }

  getCommentsByPhoto (photoId, from, callback) {
    return this.getAll({
      table: 'comments', from: from || null, index: 'photoId', indexValue: photoId
    }, callback)
  }

  get (table, itemId, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    let connection = this.connection
    let db = this.db

    let tasks = co.wrap(function * () {
      let conn = yield connection
      let queryResult = null

      if (table === 'users' || table === 'albums') {
        yield r.db(db).table(table).indexWait().run(conn)

        queryResult = yield r.db(db).table(table).getAll(itemId, {
          index: table === 'users' ? 'userName' : 'name'
        }).run(conn)
      } else {
        queryResult = yield r.db(db).table(table).get(itemId).run(conn)
      }

      try {
        if (!queryResult) {
          throw new Error()
        }

        if (table === 'users' || table === 'albums') {
          queryResult = yield queryResult.next()
        }
      } catch (e) {
        return Promise.reject(new Error(`${table.slice(0, table.length - 1)} ${itemId} not found`))
      }

      return Promise.resolve(queryResult)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }

  save (table, item, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    let connection = this.connection
    let db = this.db

    let tasks = co.wrap(function * () {
      let conn = yield connection

      if (table === 'users') {
        item.password = utils.encrypt(item.password)
      }

      item.createdAt = new Date()

      let result = yield r.db(db).table(table).insert(item).run(conn)

      if (result.errors > 0) {
        return Promise.reject(new Error(result.first_error))
      }

      item.id = result.generated_keys[0]

      yield r.db(db).table(table).get(item.id).update({
        publicId: uuid.encode(item.id)
      }).run(conn)

      let created = yield r.db(db).table(table).get(item.id).run(conn)

      return Promise.resolve(created)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }

  likeOrFollow (table, itemId, changes, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    let connection = this.connection
    let db = this.db

    // get, desde generador en co.wrap
    let get = this.get.bind(this)

    // lista de items actualizados.
    //
    // si la table es usuario, se actualizan dos
    // - el usuario que sigue.
    // - y el usuario que es seguido.
    let updated = []

    let tasks = co.wrap(function * () {
      let conn = yield connection

      itemId = (itemId instanceof Array) ? itemId : [itemId]

      for (let i = 0; i < itemId.length; i++) {
        let id = uuid.decode(itemId[1])
        let props = null

        if (table === 'photos') {
          props = { likes: changes.likes }
        } else if (table === 'albums') {
          props = { followers: changes.followers }
        } else if (table === 'users') {
          props = i === 0 ? { following: changes.following } : { followers: changes.followers }
        }

        yield r.db(db).table(table).get(id).update(props).run(conn)
        updated.push(yield get(table, itemId[i]))
      }

      return Promise.resolve((updated.length > 1 ? updated : updated[0]))
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }

  getAll (query, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    let connection = this.connection
    let db = this.db

    let tasks = co.wrap(function * () {
      let conn = yield connection

      yield r.db(db).table(query.table).indexWait().run(conn)

      let items = r.db(db).table(query.table).orderBy({index: 'createdAt'})

      if (query.index) {
        items = items.filter(function filterRow (row) {
          return row(query.index).eq(query.indexValue)
        })
      }

      items = yield items.slice(query.from || 0, query.from ? query.from + 12 : 12, { left_bound: 'closed', right_bound: 'open' }).run(conn)

      let result = yield items.toArray()

      return Promise.resolve(result)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }

  authenticate (userName, password, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    // getUser, desde generador en co.wrap
    let getUser = this.getUser.bind(this)

    let tasks = co.wrap(function * () {
      let user = null
      try {
        user = yield getUser(userName)
      } catch (e) {
        return Promise.resolve(false)
      }

      if (user.password === utils.encrypt(password)) {
        return Promise.resolve(true)
      }

      return Promise.resolve(false)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }

  getPhotoForView (query, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    let connection = this.connection
    let db = this.db
    let photoId = query.photoId

    let tasks = co.wrap(function * () {
      let conn = yield connection
      let queryResult = null

      yield r.db(db).table('photos').indexWait().run(conn)
      yield r.db(db).table('albums').indexWait().run(conn)
      yield r.db(db).table('users').indexWait().run(conn)
      yield r.db(db).table('comments').indexWait().run(conn)

      queryResult = yield r.db(db).table('photos').getAll(photoId, { index: 'publicId' })
      .map(function (photo) {
        return {
          publicId: photo('publicId'),
          url: photo('url'),
          title: photo('title'),
          likes: photo('likes'),
          album: r.db(db).table('albums').get(photo('albumId')).pluck('title', 'name'),
          user: r.db(db).table('users').get(photo('userId')).pluck('userName', 'fullName', 'avatar'),
          comments: r.db(db).table('comments').getAll(photo('publicId'), { index: 'photoId' }).map(function (comment) {
            return {
              content: comment('content'),
              createdAt: comment('createdAt'),
              user: r.db(db).table('users').get(comment('userId')).pluck('userName', 'fullName', 'avatar')
            }
          }).coerceTo('array')
        }
      })
      .run(conn)

      if (!queryResult) {
        return Promise.reject(new Error(`photo ${photoId} not found`))
      }

      let photo = yield queryResult.next()

      return Promise.resolve(photo)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }

  getAlbumForView (query, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    let connection = this.connection
    let db = this.db
    let albumName = query.albumName

    let tasks = co.wrap(function * () {
      let conn = yield connection
      let queryResult = null

      yield r.db(db).table('albums').indexWait().run(conn)
      yield r.db(db).table('photos').indexWait().run(conn)
      yield r.db(db).table('users').indexWait().run(conn)

      queryResult = yield r.db(db).table('albums').getAll(albumName, { index: 'name' })
      .map(function (album) {
        return {
          publicId: album('publicId'),
          name: album('name'),
          title: album('title'),
          description: album('description'),
          background: album('background'),
          followers: album('followers'),
          user: r.db(db).table('users').get(album('userId')).pluck('userName', 'avatar'),
          photos: r.db(db).table('photos')
          .orderBy({ index: 'createdAt' })
          .filter({ albumId: album('publicId') })
          .slice(0, 12, { left_bound: 'closed', right_bound: 'open' })
          .map(function (photo) {
            return {
              publicId: photo('publicId'),
              url: photo('url'),
              title: photo('title'),
              likes: photo('likes'),
              album: {
                title: album('title'),
                name: album('name')
              },
              user: r.db(db).table('users').get(photo('userId')).pluck('userName', 'fullName', 'avatar')
            }
          }).coerceTo('array')
        }
      })
      .run(conn)

      if (!queryResult) {
        return Promise.reject(new Error(`album ${albumName} not found`))
      }

      let album = yield queryResult.next()

      return Promise.resolve(album)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }

  getUserForView (query, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    let connection = this.connection
    let db = this.db
    let userName = query.userName

    let tasks = co.wrap(function * () {
      let conn = yield connection
      let queryResult = null

      yield r.db(db).table('albums').indexWait().run(conn)
      yield r.db(db).table('users').indexWait().run(conn)

      queryResult = yield r.db(db).table('users').getAll(userName, { index: 'userName' })
      .map(function (user) {
        return {
          publicId: user('publicId'),
          userName: user('userName'),
          fullName: user('fullName'),
          avatar: user('avatar'),
          followers: user('followers'),
          following: user('following'),
          albums: r.db(db).table('albums')
          .orderBy({ index: 'createdAt' })
          .filter({ userId: user('publicId') })
          .slice(0, 12, { left_bound: 'closed', right_bound: 'open' })
          .map(function (album) {
            return {
              publicId: album('publicId'),
              name: album('name'),
              title: album('title'),
              description: album('description'),
              background: album('background'),
              followers: album('followers'),
              user: {
                userName: user('userName'),
                avatar: user('avatar')
              }
            }
          }).coerceTo('array')
        }
      })
      .run(conn)

      if (!queryResult) {
        return Promise.reject(new Error(`user ${userName} not found`))
      }

      let user = yield queryResult.next()

      return Promise.resolve(user)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }

  getPhotosForView (query, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    let connection = this.connection
    let db = this.db

    let tasks = co.wrap(function * () {
      let conn = yield connection
      let queryResult = null

      yield r.db(db).table('photos').indexWait().run(conn)
      yield r.db(db).table('albums').indexWait().run(conn)
      yield r.db(db).table('users').indexWait().run(conn)

      queryResult = r.db(db).table('photos')
      .orderBy({ index: 'createdAt' })

      if (query.index) {
        queryResult = queryResult.filter(photo => photo(query.index).eq(query.indexValue))
      }

      queryResult = yield queryResult.slice(query.from || 0, query.from ? query.from + 12 : 12, { left_bound: 'closed', right_bound: 'open' })
      .map(function (photo) {
        return {
          publicId: photo('publicId'),
          url: photo('url'),
          title: photo('title'),
          likes: photo('likes'),
          album: r.db(db).table('albums').get(photo('albumId')).pluck('title', 'name'),
          user: r.db(db).table('users').get(photo('userId')).pluck('userName', 'fullName', 'avatar')
        }
      })
      .run(conn)

      let photos = yield queryResult.toArray()

      return Promise.resolve(photos)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }

  getAlbumsForView (query, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    let connection = this.connection
    let db = this.db

    let tasks = co.wrap(function * () {
      let conn = yield connection
      let queryResult = null

      yield r.db(db).table('albums').indexWait().run(conn)
      yield r.db(db).table('users').indexWait().run(conn)

      queryResult = yield r.db(db).table('albums')
      .orderBy({ index: 'createdAt' })
      .filter(album => album(query.index).eq(query.indexValue))
      .slice(query.from || 0, query.from ? query.from + 12 : 12, { left_bound: 'closed', right_bound: 'open' })
      .map(function (album) {
        return {
          publicId: album('publicId'),
          name: album('name'),
          title: album('title'),
          description: album('description'),
          background: album('background'),
          followers: album('followers'),
          user: r.db(db).table('users').get(album('userId')).pluck('userName', 'avatar')
        }
      })
      .run(conn)

      let albums = yield queryResult.toArray()
      return Promise.resolve(albums)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }

  getCommentsForView (query, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    let connection = this.connection
    let db = this.db

    let tasks = co.wrap(function * () {
      let conn = yield connection
      let queryResult = null

      yield r.db(db).table('comments').indexWait().run(conn)
      yield r.db(db).table('users').indexWait().run(conn)

      queryResult = yield r.db(db).table('comments')
      .orderBy({ index: 'createdAt' })
      .filter(comment => comment(query.index).eq(query.indexValue))
      .slice(query.from || 0, query.from ? query.from + 12 : 12, { left_bound: 'closed', right_bound: 'open' })
      .map(function (comment) {
        return {
          content: comment('content'),
          createdAt: comment('createdAt'),
          user: r.db(db).table('users').get(comment('userId')).pluck('userName', 'fullName', 'avatar')
        }
      })
      .run(conn)

      let comments = yield queryResult.toArray()

      return Promise.resolve(comments)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }

  saveAlbumForView (album, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    let connection = this.connection
    let db = this.db

    let tasks = co.wrap(function * () {
      let conn = yield connection

      album.createdAt = new Date()

      let result = yield r.db(db).table('albums').insert(album).run(conn)

      if (result.errors > 0) {
        return Promise.reject(new Error(result.first_error))
      }

      album.id = result.generated_keys[0]

      yield r.db(db).table('albums').get(album.id).update({
        publicId: uuid.encode(album.id)
      }).run(conn)

      yield r.db(db).table('albums').indexWait().run(conn)
      yield r.db(db).table('users').indexWait().run(conn)

      // let created = yield r.db(db).table('albums').get(album.id).run(conn)
      // created.user = yield r.db(db).table('users').get(created.userId).pluck('userName', 'avatar').run(conn)

      // delete created.userId
      // delete created.createdAt

      let queryResult = yield r.db(db).table('albums')
      .getAll(album.name, { index: 'name' })
      .map(function (album) {
        return {
          publicId: album('publicId'),
          name: album('name'),
          title: album('title'),
          description: album('description'),
          background: album('background'),
          followers: album('followers'),
          user: r.db(db).table('users').get(album('userId')).pluck('userName', 'avatar')
        }
      })
      .run(conn)

      if (!queryResult) {
        return Promise.reject(new Error(`album ${album.name} not found`))
      }

      let created = yield queryResult.next()
      return Promise.resolve(created)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }

  savePhotoForView (photo, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    let connection = this.connection
    let db = this.db

    let tasks = co.wrap(function * () {
      let conn = yield connection

      photo.createdAt = new Date()

      let result = yield r.db(db).table('photos').insert(photo).run(conn)

      if (result.errors > 0) {
        return Promise.reject(new Error(result.first_error))
      }

      photo.id = result.generated_keys[0]

      yield r.db(db).table('photos').get(photo.id).update({
        publicId: uuid.encode(photo.id)
      }).run(conn)

      let created = yield r.db(db).table('photos').get(photo.id).run(conn)
      created.user = yield r.db(db).table('users').get(created.userId).pluck('userName', 'fullName', 'avatar').run(conn)
      created.album = yield r.db(db).table('albums').get(photo.albumId).pluck('title', 'name').run(conn)

      delete created.userId
      delete created.albumId
      delete created.createdAt

      return Promise.resolve(created)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }

  saveCommentForView (comment, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    let connection = this.connection
    let db = this.db

    let tasks = co.wrap(function * () {
      let conn = yield connection

      comment.createdAt = new Date()

      let result = yield r.db(db).table('comments').insert(comment).run(conn)

      if (result.errors > 0) {
        return Promise.reject(new Error(result.first_error))
      }

      comment.id = result.generated_keys[0]

      yield r.db(db).table('comments').get(comment.id).update({
        publicId: uuid.encode(comment.id)
      }).run(conn)

      let created = yield r.db(db).table('comments').get(comment.id).run(conn)
      created.user = yield r.db(db).table('users').get(created.userId).pluck('userName', 'avatar').run(conn)

      delete created.userId
      delete created.photoId

      return Promise.resolve(created)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }
}

module.exports = Db
