export default class Photo {
  constructor (state) {
    this.publicId = state.publicId || ''
    this.url = state.url || ''
    this.title = state.title || ''
    this.likes = state.likes || 0
    this.user = state.user || {}
    this.album = state.album || {}
    this.comments = state.comments || []
  }
}
