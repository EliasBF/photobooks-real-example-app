import AlbumItem from './album-item'
import Forms from '../utils/forms'
import FormViews from '../utils/form-views'
import View from '../utils/view'
import slug from '../utils/slug'
import translate from '../utils/translate'

class Profile extends View {
  constructor (userStore, albumStore) {
    super()
    this.userStore = userStore
    this.albumStore = albumStore
  }

  template (render, state) {
    return render`
    <div class="container page" id="profile">
      <div class="row">
        <div class="col s12 m10 offset-m1 l10 offset-l1">
          <div class="row">
            <div class="col s10 offset-s1 m8 offset-m2 l4 offset-l4 center-align">
              <img src="${state.user.avatar}" alt="${state.user.userName}" class="responsive-img circle" />
            </div>
            <div class="col s12 center-align">
              <h2 class="grey-text text-darken-3">${state.user.fullName}</h2>
            </div>
          </div>
        </div>
      </div>
      <div class="row section valign-wrapper">
        <div class="col s12 m7 offset-m1 l7 offset-l1">
          <h2 class="grey-text">${translate.message('profile.albums')}</h2>
        </div>
        <div class="col s12 m3 l3">
          ${
            state.isCurrentUser
            ? render`<button id="event-new" class="waves-effect waves-light btn red darken-4 right">${translate.message('profile.new')}</button>`
            : ''
          }
        </div>
      </div>
      ${
        state.user.albums.length > 0
        ? render`
          <div class="row albums-container">
            ${
              state.user.albums.map(function (album) {
                return new AlbumItem(this.albumStore).render(album)
              }, this)
            }
          </div>
          `
        : render`
          <div class="row nothing">
            <div class="col s12 center-align">
              <p class="flow grey-text">${state.isCurrentUser ? translate.message('profile.nothing-user') : translate.message('profile.nothing')}</p>
              <i class="material-icons grey-text medium">photo_album</i>
            </div>
          </div>
          `
      }
    </div>
    `
  }

  async source (params) {
    let user, isCurrentUser

    if (this.userStore.userName === params.username) {
      user = this.userStore.user

      if (user.albums.length === 0) {
        user.albums = await this.albumStore.getAlbums(user.publicId)
      }

      isCurrentUser = true
    } else {
      user = await this.userStore.getProfile(params.username)
      isCurrentUser = false
    }

    return {
      user,
      isCurrentUser
    }
  }

  newAlbum (source, event) {
    let form = new FormViews('new-album')
    form.mount()

    form.listen('submit', async function onSubmit (event) {
      event.preventDefault()

      if (Forms.validate(form.form, form.formError)) {
        /* eslint-disable no-undef */
        let albumData = new FormData(form.form)
        /* eslint-enable no-undef */
        albumData.append('name', slug(albumData.get('title')))
        albumData.append('background', '')
        albumData.append('followers', 0)
        albumData.append('userId', this.userStore.user.publicId)
        albumData.delete('originalname')

        let created = await this.albumStore.save(albumData)
        let albumView = new AlbumItem(this.albumStore).render(created)

        if (source.user.albums.length === 0) {
          document.querySelector('#profile .nothing').remove()
          let el = document.createElement('div')
          el.className = 'row albums-container'
          document.getElementById('profile').appendChild(el)
        }

        let container = document.querySelector('#profile .albums-container')
        container.insertBefore(albumView, container.firstChild)

        form.unmount()
      }
    }.bind(this))
  }

  async show (container, params) {
    if (!this.isReady) {
      this.configure(this.template.bind(this), this.source, {
        'new-album': {
          target: 'event-new',
          eventName: 'click',
          handler: this.newAlbum,
          context: this
        }
      })

      await this.display(container, params)
      return
    }

    await this.display(container, params)
  }
}

export default Profile
