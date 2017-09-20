import Http from '../utils/http'
import Photo from '../models/photo'

class PhotosStore {
  constructor () {
    this.photos = null
  }

  // retorna una foto o varias fotos segun una consulta
  async getPhotos (query = null, next = false) {
    if (!this.photos) {
      this.photos = this.fetchPhotos()
    }

    let result = await this.photos(query, next)

    if (!(result instanceof Array)) {
      return new Photo(result)
    }

    let photos = []

    for (let photo of result) {
      photos.push(new Photo(photo))
    }

    return photos
  }

  fetchPhotos () {
    let last = 0

    return async function (query = null, next = false) {
      try {
        let querystring = ''
        let path = ''

        if (query) {
          if ('album' in query) {
            path = `/album/${query.album}`
          } else {
            path = `/${query.id}`
          }
        }

        if (next) {
          querystring = `?from=${String(last)}`
        }

        let res = await Http.get(`/api/photos${path}${querystring}`)

        if ('photo' in res.data) {
          return res.data.photo
        } else {
          if (res.data.next) {
            last += 12
          }
          return res.data.photos
        }
      } catch (err) {
        throw new Error(err)
      }
    }
  }

  async like (photo, like = true) {
    try {
      let res = await Http.post(
        `/api/photos/${photo.publicId}/like`,
        {
          likes: photo.likes + (like ? 1 : -1)
        }
      )

      return new Photo(res.data.photo)
    } catch (err) {
      throw new Error(err)
    }
  }

  async save (photo) {
    try {
      let res = await Http.post(`/api/photos`, photo)
      return new Photo(res.data.photo)
    } catch (err) {
      throw new Error(err)
    }
  }

  async update (photo) {
    try {
      let res = await Http.put(`/api/photos`, { photo })
      return new Photo(res.data.photo)
    } catch (err) {
      throw new Error(err)
    }
  }

  async delete (photoId) {
    try {
      await Http.delete(`/api/photos/${photoId}`)
      return
    } catch (err) {
      throw new Error(err)
    }
  }
}

export default PhotosStore
