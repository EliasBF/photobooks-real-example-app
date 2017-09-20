import View from '../utils/view'
import PhotoItem from './photo-item'
import Forms from '../utils/forms'
import FormViews from '../utils/form-views'
import translate from '../utils/translate'

class Album extends View {
  constructor (userStore, photosStore, albumStore) {
    super()
    this.userStore = userStore
    this.photosStore = photosStore
    this.albumStore = albumStore
  }

  template (render, state) {
    return render`
    <div class="container page" id="album">
      <div class="row">
        <div class="col s12 m10 offset-m1 l10 offset-l1">
          <div class="row section">
            <div class="col s12">
              <div class="row left-align">
                <div class="col s12">
                  <h2 class="grey-text text-darken-3">${state.album.title}</h2>
                </div>
                <div class="col s12">
                  <div class="row valign-wrapper">
                    <div class="col s2 offset-s10">
                      <a href="/profile/${state.album.user.userName}">
                        <img src="${state.album.user.avatar}" alt="${state.album.user.userName}" class="responsive-img circle" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col s12">
              <p class="flow-text">${state.album.description}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        ${
          state.isCurrentUser
          ? render`
            <div class="col s12 center" style="margin-bottom: 4em">
              <button id="event-add" class="waves-effect waves-light btn red darken-4">${translate.message('albums.add-photo')}</button>
            </div>
            `
          : ''
        }
        ${
          state.album.photos.length > 0
          ? render`
            <div class="col s12 cards-container">
              ${state.album.photos.map(function (photo) { return new PhotoItem().render(photo) })}
            </div>
            `
          : render`
            <div class="section">
              <div class="col s12 cards-container">
              </div>
              <div class="nothing center-align">
                <p class="flow grey-text">${state.isCurrentUser ? translate.message('albums.nothing-user') : translate.message('albums.nothing')}}</p>
                <i class="material-icons grey-text medium">photo_album</i>
              </div>
            </div>
            `
        }
      </div>
    </div>
    `
  }

  async source (params) {
    let isCurrentUser

    if (this.userStore.userName === params.username) {
      isCurrentUser = true
    } else {
      isCurrentUser = false
    }

    let album = await this.albumStore.getAlbum(params.name)

    return {
      album,
      isCurrentUser
    }
  }

  addPhoto (source, event) {
    let form = new FormViews('add-photo')
    form.mount()

    form.listen('submit', async function onSubmit (event) {
      event.preventDefault()

      if (Forms.validate(form.form, form.formError)) {
        /* eslint-disable no-undef */
        let photoData = new FormData(form.form)
        /* eslint-enable no-undef */
        photoData.append('url', '')
        photoData.append('likes', 0)
        photoData.append('userId', this.userStore.user.publicId)
        photoData.append('albumId', source.album.publicId)
        photoData.delete('originalname')

        let created = await this.photosStore.save(photoData)
        let photoView = new PhotoItem().render(created)

        let container = document.querySelector('#album .cards-container')
        let nothing = document.querySelector('#album .nothing')

        container.insertBefore(photoView, container.firstChild)

        if (nothing) {
          nothing.remove()
        }

        form.unmount()
      }
    }.bind(this))
  }

  async show (container, params) {
    if (!this.isReady) {
      this.configure(this.template, this.source, {
        'add-photo': {
          target: 'event-add',
          eventName: 'click',
          handler: this.addPhoto,
          context: this
        },
        'follow-album': {
          target: 'event-follow',
          eventName: 'click',
          handler: this.followAlbum,
          context: this
        }
      })

      await this.display(container, params)
      return
    }

    await this.display(container, params)
  }
}

export default Album
