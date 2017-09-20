export default class Album {
  constructor (state) {
    this.publicId = state.publicId || ''
    this.name = state.name || ''
    this.title = state.title || ''
    this.description = state.description || ''
    this.background = state.background || ''
    this.followers = state.followers || 0
    this.user = state.user || {}
    this.photos = state.photos || []
  }
}
