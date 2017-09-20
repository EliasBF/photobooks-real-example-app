import yo from 'yo-yo'

class View {
  constructor () {
    // DOM id del contenedor de la vista
    this._elementId = null
    // Metodo para renderizar la vista
    this._render = null
    // Metodo para obtener los datos utilizados por la vista
    this._source = null
    // template string del cuerpo de la vista (usado por yo-yo)
    this._template = null
    // Array de eventos con oyente definido
    this._events = null
    // Array de eventos a los que aun no se les ha definido un oyente
    // Ej: boton dentro de un condicional.
    this._pendingEvents = null
    // Configuración para definir eventos en la vista
    this._configEvents = null
    // datos usados por la vista en el ultimo render
    this._tempState = null

    this.isReady = false
  }

  _renderClosure () {
    let _params = null

    async function exec () {
      let state = null
      if (this._source) {
        state = await this._source(_params)
        this._tempState = state
      }

      return this._template(state)
    }

    return async function (params) {
      if (!_params) {
        _params = params

        let el = await exec.apply(this)

        if (!this._elementId) {
          let id = el.getAttribute('id')

          if (!id) {
            id = `view${Date.now().toString()}`
          }

          this._elementId = id
        }

        return el
      }

      let eq = false
      let keys = Object.keys(params)

      for (let key of keys) {
        eq = _params[key] === params[key] || false
      }

      if (!eq) {
        _params = params
        return await exec.apply(this)
      }

      return null
    }
  }

  _setupEvents (el) {
    let events = Object.keys(this._configEvents)

    function setEvent (target, eventName, handler, context) {
      target.addEventListener(eventName, this._tempState ? handler.bind(context, this._tempState) : handler.bind(context))
      this._events.push({ target: target, type: eventName, handler: handler })
    }

    for (let event of events) {
      let eventData = this._configEvents[event]
      let target = el.querySelector(`#${eventData.target}`)

      if (target) {
        setEvent.apply(this, [target, eventData.eventName, eventData.handler, eventData.context || null])
      } else {
        if (!this._pendingEvents) {
          this._pendingEvents = []
        }

        this._pendingEvents.push(eventData)
      }
    }

    this._configEvents = null
    if (this._tempState) {
      this._tempState = null
    }
  }

  _setupPendingEvents (el) {
    console.log(this._pendingEvents)
    this._pendingEvents.forEach(function forItemIn (event, index) {
      let target = el.querySelector(`#${event.target}`)

      if (target) {
        target.addEventListener(event.eventName, event.handler.bind(event.context || null, this._tempState))
        this._events.push({ target: target, type: event.eventName, handler: event.handler })
        this._pendingEvents.splice(1, index)
      }
    }, this)

    this._tempState = null
  }

  configure (template, source = null, events = null) {
    if (!template) {
      throw new Error('template is required.')
    }
    if (events) {
      if (!(events instanceof Object)) {
        throw new Error('events config required an object')
      }
    }

    this._template = function (state) { return template(yo, state) }
    this._source = source
    this._configEvents = events
    this._render = this._renderClosure()
  }

  destroy () {
    if (!this.isReady) {
      throw new Error('current view is not configured.')
    }

    if (this._events && this._events.length > 0) {
      this._events.forEach(function forItemIn (event) {
        event.target.removeEventListener(event.type, event.handler)
      }, this)

      this._events = this._pendingEvents = null
    }

    if (this._elementId) {
      let el = document.getElementById(this._elementId)
      el.remove()
      this._elementId = null
    }

    this._render = this._source = this._template = null
  }

  async display (container, params = null) {
    if (!this._template) {
      throw new Error('view is not configured.')
    }

    let el = await this._render(params)
    let elementInDom = container.querySelector(`#${this._elementId}`)

    if (elementInDom) {
      if (el) {
        yo.update(elementInDom, el)
        if (this._pendingEvents && this._pendingEvents.length > 0) {
          this._setupPendingEvents(elementInDom)
        }
      }
      elementInDom.classList.add('selected')
    } else {
      container.insertBefore(el, container.lastChild)
      el.classList.add('selected')
    }

    if (this._configEvents) {
      this._events = []
      this._setupEvents(el)
    }

    if (!this.isReady) {
      this.isReady = true
    }
  }
}

export default View
