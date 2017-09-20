import page from 'page'
import { authenticate, preload } from './middleware'

export function createAndAllowRoutes () {
  page('/', authenticate, preload)
  page('/signin', authenticate, preload)
  page('/signup', authenticate, preload)
  page('/profile/:username', authenticate, preload)
  page('/:username/album/:name', authenticate, preload)
  page('/:username/photo/:id', authenticate, preload)
  page.start()

  return page
}
