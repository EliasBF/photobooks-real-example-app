import 'babel-polyfill'

// requerimientos de materializecss
/* eslint-disable no-unused-vars */
import $ from 'jquery'
/* eslint-enable: no-unused-vars */
import 'materialize'

import di from 'di4es'

import {
  UserStore, PhotosStore, AlbumStore, CommentsStore
} from './store'
import {
  Layout, Home, SignIn, SignUp, Profile, Album, Photo
} from './views'
import App from './app'

// Configurar el inyector de dependencias
di
  .autowired(false)
  .register('userStore').as(UserStore).asSingleton()
  .register('photosStore').as(PhotosStore).asSingleton()
  .register('albumStore').as(AlbumStore).asSingleton()
  .register('commentsStore').as(CommentsStore).asSingleton()
  .register('layout').as(Layout).withConstructor().param('userStore').ref('userStore').asSingleton()
  .register('signin').as(SignIn).withConstructor().param('userStore').ref('userStore').asSingleton()
  .register('signup').as(SignUp).withConstructor().param('userStore').ref('userStore').asSingleton()
  .register('profile').as(Profile).withConstructor().param('userStore').ref('userStore').param('albumStore').ref('albumStore').asSingleton()
  .register('home').as(Home).withConstructor().param('photosStore').ref('photosStore').asSingleton()
  .register('album').as(Album).withConstructor().param('userStore').ref('userStore').param('photosStore').ref('photosStore').param('albumStore').ref('albumStore').asSingleton()
  .register('photo').as(Photo).withConstructor().param('userStore').ref('userStore').param('photosStore').ref('photosStore').param('commentsStore').ref('commentsStore').asSingleton()
  .register('app').as(App).withConstructor()
  .param('userStore').ref('userStore')
  .param('layout').ref('layout')
  .param('signin').ref('signin')
  .param('signup').ref('signup')
  .param('profile').ref('profile')
  .param('home').ref('home')
  .param('album').ref('album')
  .param('photo').ref('photo')

const app = di.resolve('app')
app.start()
