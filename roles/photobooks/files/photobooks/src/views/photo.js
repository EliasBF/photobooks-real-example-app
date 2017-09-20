import View from '../utils/view'
import CommentItem from './comment-item'
import translate from '../utils/translate'

class Photo extends View {
  constructor (userStore, photosStore, commentsStore) {
    super()
    this.userStore = userStore
    this.photosStore = photosStore
    this.commentsStore = commentsStore
  }

  template (render, state) {
    return render`
    <div class="container page" id="photo">
      <div class="row">
        <div class="col s6 m4 l3">
          <a href="/eliasbf/album/${state.photo.album.name}" class="waves-effect waves-light btn grey lighten-1 grey-text text-darken-3">
          ${translate.message('photo.go-album')}
          </a>
        </div>
      </div>
      <div class="row center-align">
        <div class="col s12">
          <img src="/${state.photo.url}" class="responsive-img" />
        </div>
      </div>
      
      <div class="divider"></div>
      <div style="margin:0" class="row valign-wrapper section">
        <div class="col s3 m2 offset-m1 l1 offset-l2">
          <img src="${state.photo.user.avatar}" alt="${state.photo.user.userName}" class="responsive-img circle" />
        </div>
        <div style="margin-left:0" class="col s9 m7 l7">
          <div style="margin:0" class="row">
            <div class="col s12">
              <span class="grey-text text-darken-3">${state.photo.user.fullName}</span>
              <span style="margin-left:4px" class="grey-text">${translate.message('photo.save-in')}</span>
              <span style="margin-left:4px" class="grey-text text-darken-3">${state.photo.album.title}</span>
            </div>
            <div class="col s12">
              <span class="grey-text">${state.photo.title}</span>
            </div>
          </div>
        </div>
      </div> 

      <div class="divider"></div>
      <div class="row section">
        <div class="col s12 m10 offset-m1 l10 offset-l1">
          <div class="card">
            <div class="card-content">
              <div class="row">
                <div class="input-field col s12">
                  <textarea id="textareacomment" class="materialize-textarea" placeholder="${translate.message('photo.add-comment')}"></textarea>
                </div>
              </div>
            </div>
            <div class="card-action right-align">
              <button id="event-publish" class="waves-effect waves-light btn red darken-4">${translate.message('photo.publish')}</button>
            </div>
          </div>
        </div>
      
        <div class="col s12 m10 offset-m1 l10 offset-l1">
          <h5 class="grey-text text-darken-3">${translate.message('photo.comments')}</h5>
          <div class="row">
            <div class="col s12 comments-container">
              ${
                state.photo.comments.length === 0
                ? render`<p class="grey-text">${translate.message('photo.not-comments')}</p>`
                : state.photo.comments.map(function (comment) { return CommentItem.render(comment) })
              }
            </div>
          </div>
        </div>
      </div>
    </div>`
  }

  async source (params) {
    let isCurrentUser

    if (this.userStore.userName === params.username) {
      isCurrentUser = true
    } else {
      isCurrentUser = false
    }

    let photo = await this.photosStore.getPhotos({ id: params.id })

    return {
      photo,
      isCurrentUser
    }
  }

  async publishComment (source, event) {
    let container = document.querySelector('#photo .comments-container')

    if (source.photo.comments.length === 0) {
      container.querySelector('p').remove()
    }

    let textarea = document.getElementById('textareacomment')
    let comment = {
      content: textarea.value,
      userId: this.userStore.user.publicId,
      photoId: source.photo.publicId
    }

    let created = await this.commentsStore.save(comment)
    let commentView = CommentItem.render(created)

    if (source.photo.comments.length > 0) {
      container.insertBefore(commentView, container.firstChild)
    } else {
      container.append(commentView)
    }

    textarea.value = ''
  }

  async show (container, params) {
    if (!this.isReady) {
      this.configure(this.template, this.source, {
        'publish-comment': {
          target: 'event-publish',
          eventName: 'click',
          handler: this.publishComment,
          context: this
        }
      })

      await this.display(container, params)
      return
    }

    await this.display(container, params)
  }
}

export default Photo
