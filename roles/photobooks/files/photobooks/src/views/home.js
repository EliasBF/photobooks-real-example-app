import View from '../utils/view'
import PhotoItem from './photo-item'
import translate from '../utils/translate'

class Home extends View {
  constructor (photosStore) {
    super()
    this.photosStore = photosStore
  }

  template (render, state) {
    return render`
    <div class="container page" id="home">
      <div class="row">
        ${
          state.photos.length > 0
          ? render`
            <div class="col s12 cards-container">
              ${state.photos.map(function (photo) { return new PhotoItem().render(photo) })}
            </div>
            `
          : render`
            <div class="col s12 nothing center-align">
              <p class="flow grey-text text-darken-3">${translate.message('home.nothing')}</p>
              <p class="flow grey-text">${translate.message('home.nothing-user')}</p>
              <i class="material-icons large">photo_album</i>                        
            </div>
            `
        }
      </div>
    </div>
    `
  }

  async source (params) {
    const photos = await this.photosStore.getPhotos()

    return {
      photos
    }
  }

  async show (container, params) {
    if (!this.isReady) {
      this.configure(this.template, this.source)

      await this.display(container, params)
      return
    }

    await this.display(container, params)
  }
}

export default Home
