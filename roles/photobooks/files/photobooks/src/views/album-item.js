import yo from 'yo-yo'

class AlbumItem {
  constructor (albumStore) {
    this.albumStore = albumStore
  }

  render (state) {
    return yo`
      <div class="col s12 m10 offset-m1 l10 offset-l1" id="album${state.publicId}">
        <a href="/${state.user.userName}/album/${state.name}">
          <div class="card hoverable grey-text text-lighten-1">
            <div class="card-image">
              <img src="/${state.background}">
            </div>
            <div class="card-content">
              <div class="row">
                <div class="col s6">
                  <span class="card-title grey-text text-darken-4">${state.title}</span>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    `
  }
}

export default AlbumItem
