import page from 'page'
import JWT from '../utils/jwt'
import Events from '../utils/events'

function authenticate (ctx, next) {
  if (JWT.getToken()) {
    if (!/\/signin|\/signup/.test(ctx.path)) {
      next()
    } else {
      page.redirect('/')
    }
  } else {
    if (!/\/signin|\/signup/.test(ctx.path)) {
      page.redirect('/signin')
    } else {
      next()
    }
  }
}

function preload (ctx, next) {
  const paths = ctx.path.match(/\/(\w+)/g)
  const truncatePath = (path) => path.replace('/', '')
  // '/' === null
  const path = paths ? (paths.length > 2 ? truncatePath(paths[1]) : truncatePath(paths[0])) : 'home'

  let container = document.querySelector('main')
  let loader = document.getElementById('loader')

  if (container.children.length > 2) {
    container.querySelector('.page.selected').classList.remove('selected')
  }

  loader.classList.add('selected')

  document.body.scrollTop = 0

  Events.emit('router:route', {
    path: path,
    params: /album|profile|photo/.test(path) ? ctx.params : null
  })
}

module.exports = {
  authenticate,
  preload
}
