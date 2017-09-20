export default class User {
  constructor (state) {
    this.publicId = state.publicId || ''
    this.userName = state.userName || ''
    this.fullName = state.fullName || ''
    this.avatar = state.avatar || ''
    this.followers = state.followers || 0
    this.following = state.following || 0
    this.albums = state.albums || []
  }
}
