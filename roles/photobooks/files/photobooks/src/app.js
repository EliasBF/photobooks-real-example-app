import Events from './utils/events'
import JWT from './utils/jwt'
import { createAndAllowRoutes } from './routes'

class App {
  constructor (
    userStore, layout, signin, signup,
    profile, home, album, photo
  ) {
    this.userStore = userStore
    this.layout = layout
    this.signin = signin
    this.signup = signup
    this.profile = profile
    this.home = home
    this.album = album
    this.photo = photo
  }

  async showView (route) {
    if (route.path === 'signin' || route.path === 'signup') {
      this.layout.show(false)
    } else {
      this.layout.show()
    }

    let container = document.querySelector('main')
    let loader = document.getElementById('loader')

    await this[route.path].show(container, route.params)
    loader.classList.remove('selected')
  }

  /*
  TODO: manageScroll (route) {} Metodo para cargar datos en el scroll de ciertas views
  TODO: displayontentLoader (show = true) {} Metodo para mostrar o ocultar el loader al cargar datos en el scroll
  */

  async start () {
    // cargar usuario
    if (JWT.getToken()) {
      await this.userStore.populate()
    }

    // insertando layout en el DOM
    this.layout.mount()

    // manejando eventos globales
    Events.on('router:route', function onRoute (event) {
      this.showView(event.detail)
      // this.manageScroll(event.detail)
    }, this, null)

    Events.on('userStore:signin', function signIn (event) {
      // mostrar header con el usuario loggeado
      this.layout.update()
      this.router.redirect('/')
    }, this, null)

    Events.on('userStore:signup', function signUp (event) {
      this.router.redirect('/signin')
    }, this, null)

    Events.on('global:noauth', function sessionExpired (event) {
      this.router.redirect('/signin')
    }, this, null)

    Events.on('formview:mount', function formViewMount (event) {
      document.querySelector('.main-container').classList.add('hidden')
    }, this, null)

    Events.on('formview:unmount', function formViewMount (event) {
      document.querySelector('.main-container').classList.remove('hidden')
    }, this, null)

    // inicializando el router
    this.router = createAndAllowRoutes()
  }
}

export default App
