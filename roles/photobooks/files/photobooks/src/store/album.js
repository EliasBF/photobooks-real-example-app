import Http from '../utils/http'
import Album from '../models/album'

class AlbumStore {
  constructor () {
    this.albums = null
  }

  async getAlbum (albumName) {
    let res = await Http.get(`/api/albums/${albumName}`)
    return new Album(res.data.album)
  }

  async getAlbums (userId, next = false) {
    if (!this.albums) {
      this.albums = this.fetchAlbums()
    }

    let result = await this.albums(userId, next)

    let albums = []

    for (let album of result) {
      albums.push(new Album(album))
    }

    return albums
  }

  fetchAlbums () {
    let last = 0

    return async function (userId, next = false) {
      try {
        let querystring = ''

        if (next) {
          querystring = `?from=${String(last)}`
        }

        let res = await Http.get(`/api/albums/user/${userId}${querystring}`)

        if (res.data.next) {
          last += 12
        }
        return res.data.albums
      } catch (err) {
        throw new Error(err)
      }
    }
  }

  async follow (album, follow = true) {
    try {
      let res = await Http.post(
        `/api/albums/${album.publicId}/follow`,
        {
          followers: album.followers + (follow ? 1 : -1)
        }
      )

      return new Album(res.data.album)
    } catch (err) {
      throw new Error(err)
    }
  }

  async save (album) {
    try {
      let res = await Http.post(`/api/albums`, album)
      return new Album(res.data.album)
    } catch (err) {
      throw new Error(err)
    }
  }

  async update (album) {
    try {
      let res = await Http.put(`/api/albums`, { album })
      return new Album(res.data.album)
    } catch (err) {
      throw new Error(err)
    }
  }

  async delete (albumId) {
    try {
      await Http.delete(`/api/albums${albumId}`)
      return
    } catch (err) {
      throw new Error(err)
    }
  }
}

export default AlbumStore
