class JWT {
  static getToken () {
    if (window.localStorage['jwtToken']) {
      return window.localStorage['jwtToken']
    } else {
      return null
    }
  }

  static saveToken (token) {
    window.localStorage['jwtToken'] = token
  }

  static destroyToken () {
    window.localStorage.removeItem('jwtToken')
  }
}

export default JWT
