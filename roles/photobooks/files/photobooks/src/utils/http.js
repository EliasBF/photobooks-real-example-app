/*
TODO: Añadir como servicio al inyector de dependencias ¿?
*/

import Events from './events'
import JWT from './jwt'
import axios from 'axios'

class Http {
  static async get (url, auth = true) {
    try {
      let response = await axios({
        url,
        method: 'GET',
        headers: Http._setHeaders(auth),
        responseType: 'json'
      })

      return response.data
    } catch (err) {
      throw new Error(err)
    }
  }

  static async post (url, body, auth = true) {
    try {
      let response = await axios({
        url,
        method: 'POST',
        headers: Http._setHeaders(auth),
        data: body,
        responseType: 'json'
      })

      return response.data
    } catch (err) {
      throw new Error(err)
    }
  }

  static async put (url, body, auth = true) {
    try {
      let response = await axios({
        url,
        method: 'PUT',
        headers: Http._setHeaders(auth),
        data: body,
        responseType: 'json'
      })

      return response.data
    } catch (err) {
      throw new Error(err)
    }
  }

  static async delete (url, auth = true) {
    try {
      let response = await axios({
        url,
        method: 'DELETE',
        headers: Http._setHeaders(auth),
        responseType: 'json'
      })

      return response.data
    } catch (err) {
      throw new Error(err)
    }
  }

  static _setHeaders (auth) {
    let headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }

    if (!auth) {
      return headers
    }

    try {
      let token = JWT.getToken()

      if (!token) {
        Events.emit('global:noauth')
      }

      headers['Authorization'] = `Bearer ${token}`
      return headers
    } catch (err) {
      throw new Error(err)
    }
  }
}

export default Http
