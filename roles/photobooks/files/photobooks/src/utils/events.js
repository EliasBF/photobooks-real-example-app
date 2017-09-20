/*
TODO: Añadir como servicio al inyector de dependencias ¿?
*/

class Events {
  // Utiliza el objeto window como target para los eventos (eventos globales)

  static on (eventName, handler, target = null, ctx = null) {
    // target, objeto this del handler (default : null)
    // ctx, objeto adicional pasado al handler
    // handler, funcion a ejecutar al emitir el evento
    //    (handler(ctx, event)
    //      : ctx, objeto pasado en ctx (incluir solo si se pasa un valor a ctx)
    //      : event, detalle del evento emitido
    if (!window._events) { window._events = {} }

    (window._events[eventName] = window._events[eventName] || []).push([handler, ctx])
    if (ctx) return window.addEventListener(eventName, handler.bind(target, ctx))
    return window.addEventListener(eventName, handler.bind(target))
  }

  static off (eventName, handler = null) {
    // si handler no es null se apaga unicamente ese handler para el evento
    // de otro modo se apagan todos los handler del evento
    if (!window._events) { window._events = {} }

    let list = window._events[eventName] || []
    if (!list.length) return
    if (handler) {
      list.some(function (event, index) {
        if (handler === event[0]) {
          list.splice(index, 1)
          window.removeEventListener(eventName, handler)
          return true
        }
      })
    } else {
      let i = list.length
      while (i--) {
        list.splice(i, 1)
        window.removeEventListener(eventName, handler)
      }
    }
  }

  static emit (eventName, detail = null) {
    let event = new Event(eventName)
    if (detail) event['detail'] = detail
    window.dispatchEvent(event)
  }
}

export default Events
