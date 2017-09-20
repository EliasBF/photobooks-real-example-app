/*
TODO: Añadir como servicio al inyector de dependencias ¿?
*/

import yo from 'yo-yo'
import Events from './events'
import translate from './translate'

// Generador de vistas para formularios
class FormViews {
  constructor (type) {
    if (!type) {
      throw new Error('type is required')
    }

    this._type = type
    this.form = null
    this.formError = null
    this._events = {}
  }

  mount () {
    let el = yo`<div class="container" id="form-view"><div class="row">${this._generateView()}</div></div>`
    this.form = el.querySelector('form')
    this.formError = el.querySelector('#form-error')

    document.body.appendChild(el)
    Events.emit('formview:mount')
  }

  unmount () {
    let eventsNames = Object.keys(this._events)

    for (let event of eventsNames) {
      this.form.removeEventListener(event, this._events[event])
    }

    document.body.removeChild(document.getElementById('form-view'))

    Events.emit('formview:unmount')
  }

  listen (eventName, handler) {
    this._events[eventName] = handler
    this.form.addEventListener(eventName, handler)
  }

  _template (state) {
    return yo`
      <div class="col s12" style="margin-top:2em;margin-bottom:2em">
        <h4>${state.title}</h4>
        <span class="grey-text text-darken-3">${state.description}</span>
        <form novalidate>
          <div class="row">
            <div class="col s12">
              ${state.fields}
            </div>
            <div class="col s12">
              <div class="section right">
                <button class="btn waves-effect waves-light grey lighten-1 grey-text text-darken-3" onclick=${this.unmount.bind(this)}>${state.cancelText}</button>
                <button class="btn waves-effect waves-light red darken-4" style="margin-left:2em" type="submit">${state.successText}</button>
              </div>
            </div>
            <div class="col s12">
              <div id="form-error" class="card-panel red darken-4 hide">
                <span class="white-text">${translate.message('form.error')}</span>
              </div>
            </div>
          </div>
        </form>
      </div>`
  }

  _generateView () {
    let el

    switch (this._type) {
      case 'new-album':
        el = this._template({
          title: translate.message('form.new-album.title'),
          description: translate.message('form.new-album.description'),
          fields: yo`
            <div class="section">
              <input type="text" name="title" placeholder="${translate.message('form.new-album.input.title')}" required />
              <div class="input-field">
                <textarea name="description" class="materialize-textarea" placeholder="${translate.message('form.new-album.input.description')}" required></textarea>
              </div>
              <div class="file-field input-field">
                <div class="btn">
                  <span>${translate.message('form.new-album.input.cover')}</span>
                  <input name="photo" type="file" required />
                </div>
                <div class="file-path-wrapper">
                  <input name="originalname" class="file-path" type="text" />
                </div>
              </div>
              <p class="grey-text">${translate.message('form.new-album.help.first')}</p>
              <p class="grey-text">${translate.message('form.new-album.help.second')}</p>
            </div>`,
          successText: translate.message('form.new-album.success'),
          cancelText: translate.message('form.cancel')
        })
        break
      case 'add-photo':
        el = this._template({
          title: translate.message('form.add-photo.title'),
          description: translate.message('form.add-photo.description'),
          fields: yo`
            <div class="section">
              <input type="text" name="title" placeholder="${translate.message('form.add-photo.input.title')}" required />
              <div class="file-field input-field">
                <div class="btn">
                  <span>${translate.message('form.add-photo.input.photo')}</span>
                  <input name="photo" type="file" required />
                </div>
                <div class="file-path-wrapper">
                  <input name="originalname" class="file-path" type="text" />
                </div>
              </div>
            </div>`,
          successText: translate.message('form.add-photo.success'),
          cancelText: translate.message('form.cancel')
        })
        break
    }

    return el
  }
}

export default FormViews
