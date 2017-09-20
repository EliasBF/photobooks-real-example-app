import Http from '../utils/http'
import JWT from '../utils/jwt'
import Events from '../utils/events'

import User from '../models/user'

class UserStore {
  constructor () {
    // usuario autenticado
    this.currentUser = {}
  }

  get user () {
    return this.currentUser
  }

  get isAuthenticated () {
    return (JWT.getToken() && typeof window.localStorage['userName'] !== 'undefined')
  }

  // el nombre de usuario se almacena en localStorage
  // junto al JWT, para obtener los datos del usuario.
  get userName () {
    return window.localStorage['userName'] || null
  }

  set userName (val) {
    if (!val) {
      window.localStorage.removeItem('userName')
    } else {
      window.localStorage['userName'] = val
    }
  }

  setAuth (user, token = null) {
    if (token) {
      JWT.saveToken(token)
    }
    this.userName = user.userName
    this.currentUser = new User(user)
  }

  purgeAuth () {
    JWT.destroyToken()
    this.userName = null
    this.currentUser = {}
  }

  async attemptAuth (credentials) {
    try {
      let res = await Http.post(
        '/signin',
        { userName: credentials.userName, password: credentials.password },
        false
      )

      this.setAuth(res.data.user, res.data.token)
      Events.emit('userStore:signin')
    } catch (err) {
      throw new Error(err)
    }
  }

  // Comprueba el token en localStorage y carga los datos del usuario.
  // Esto se ejecuta siempre al inicio de la aplicación.
  async populate () {
    try {
      if (this.isAuthenticated) {
        let res = await Http.get(`/api/users/${this.userName}`)
        this.setAuth(res.data.user)
      } else {
        // Remover cualquier rastro del estado de previas
        // autenticaciones.
        this.purgeAuth()
      }
    } catch (err) {
      this.purgeAuth()
      throw new Error(err)
    }
  }

  // Actualiza el usuario en el servidor.
  async update (user) {
    let res = await Http.put('/api/users', { user })
    this.currentUser = new User(res.data.user)
    return this.currentUser
  }

  // solo se ejecuta durante el signup.
  async save (user) {
    user['avatar'] = ''
    user['followers'] = 0
    user['following'] = 0

    await Http.post('/signup', user, false)
    Events.emit('userStore:signup')
  }

  // obtener el perfil de un usuario.
  async getProfile (userName) {
    let res = await Http.get(`/api/users/${userName}?view=true`)
    return new User(res.data.user)
  }

  async followProfile (user, follow = true) {
    let res = await Http.put(
      `/api/users/${user.userId}/follow`,
      {
        followerId: this.currentUser.publicId,
        followers: user.followers + (follow ? 1 : -1),
        following: this.currentUser.following + (follow ? 1 : -1)
      }
    )

    this.currentUser = new User(res.data.follower)
    // retorna el usuario al que se da follow y el usuario autenticado.
    return [new User(res.data.user), this.currentUser]
  }
}

export default UserStore
