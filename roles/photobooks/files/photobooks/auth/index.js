'use strict'

const JWTStrategy = require('passport-jwt').Strategy
const ExtractJWT = require('passport-jwt').ExtractJwt
const bearer = require('token-extractor')
const photobooks = require('photobooks-client')
const config = require('../config')

const client = photobooks.createClient(config.client)

module.exports.jwtStrategy = new JWTStrategy(
  {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.secret,
    passReqToCallback: true
  },
  (req, payload, done) => {
    extractToken(req, (err, token) => {
      if (err) {
        return done(err, false, { message: `invalid token` })
      }

      req.token = token

      client.getUser(payload.userName, token, false, (err, user) => {
        if (err) {
          return done(err, false, { message: `invalid token` })
        }

        return done(null, user)
      })
    })
  })

function extractToken (req, callback) {
  bearer(req, callback)
}
