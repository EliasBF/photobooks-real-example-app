'use strict'

const crypto = require('crypto')

function encrypt (password) {
  let shasum = crypto.createHash('sha256')
  shasum.update(password)
  return shasum.digest('hex')
}

// TODO: Funcion para generar datos para los tests

module.exports = {
  encrypt
}
