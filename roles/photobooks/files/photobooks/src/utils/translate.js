/*
TODO: Añadir como servicio al inyector de dependencias ¿?
*/

if (!window.Intl) {
  window.Intl = require('intl')
  require('intl/locale-data/jsonp/en-US.js')
  require('intl/locale-data/jsonp/es.js')
}

const IntlRelativeFormat = window.IntlRelativeFormat = require('intl-relativeformat')
const IntlMessageFormat = require('intl-messageformat')

require('intl-relativeformat/dist/locale-data/en.js')
require('intl-relativeformat/dist/locale-data/es.js')

const es = require('./lang/es')
const en = require('./lang/en-US')

const MESSAGES = {
  'es': es,
  'en-US': en
}

const locale = window.localStorage.locale || 'es'

function message (text, opts) {
  opts = opts || {}
  let msg = new IntlMessageFormat(MESSAGES[locale][text], locale, null)
  return msg.format(opts)
}

module.exports = {
  message,
  date: new IntlRelativeFormat(locale)
}
