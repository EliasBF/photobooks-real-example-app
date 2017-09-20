export default class Comment {
  constructor (state) {
    this.publicId = state.publicId || ''
    this.user = state.user || {}
    this.createdAt = state.createdAt || new Date()
    this.content = state.content || ''
  }
}
