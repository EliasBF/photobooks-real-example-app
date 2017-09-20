import Http from '../utils/http'
import Comment from '../models/comment'

class CommentsStore {
  constructor () {
    this.comments = null
  }

  async getComments (photoId, next = false) {
    if (!this.comments) {
      this.comments = this.fetchComments()
    }

    let result = await this.comments(photoId, next)

    let comments = []

    for (let comment of result) {
      comments.push(new Comment(comment))
    }

    return comments
  }

  fetchComments () {
    let last = 0

    return async function (photoId, next = false) {
      try {
        let querystring = ''

        if (next) {
          querystring = `?from=${last}`
        }

        let res = await Http.get(`/api/comments/photo/${photoId}${querystring}`)

        if (res.data.next) {
          last += 12
        }
        return res.data.comments
      } catch (err) {
        throw new Error(err)
      }
    }
  }

  async save (comment) {
    try {
      let res = await Http.post(`/api/comments`, comment)
      return new Comment(res.data.comment)
    } catch (err) {
      throw new Error(err)
    }
  }
}

export default CommentsStore
