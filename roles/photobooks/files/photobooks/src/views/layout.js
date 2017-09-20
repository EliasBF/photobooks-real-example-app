import $ from 'jquery'
import yo from 'yo-yo'
import translate from '../utils/translate'

class Layout {
  constructor (userStore) {
    this.userStore = userStore
  }

  render () {
    const user = this.userStore.user

    return yo`
            <div class="main-container">
                <header class="navbar-fixed">
                    <nav>
                        <div class="nav-wrapper red darken-4">
                            <a href="/" class="left brand-logo">
                                <img src="/icons/pb.png" class="responsive-img" alt="PhotoBooks">
                            </a>
                            <ul class="right">
                                <li><a href="/">${translate.message('home')}</a></li>
                                <li>
                                    <a style="height:100%"href="/profile/${user.userName || ''}" class="valign-wrapper">
                                        <div class="chip transparent white-text" style="line-height:35px">
                                            <img src="${user.avatar || ''}" alt="${user.fullName || ''}" />
                                            ${user.fullName ? user.fullName.split(' ')[0] : ''}
                                        </div>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </header>
                <main class="grey lighten-4">
                    <div class="container" id="loader"></div>
                    <div class="container" id="contentloader"></div>
                </main>
                <footer class="red darken-4 white-text">
                    <div class="container">
                        <div class="row valign-wrapper">
                            <div class="col s3 m2 l2 left-align">
                                <a href="#" onclick=${this.openLangDropdown.bind(null)} data-activates="dropdownlang" class="dropdown-button btn grey lighten-1 grey-text text-darken-3">${translate.message('language')}</a>
                                <ul id="dropdownlang" class="dropdown-content">
                                    <li><a href="#" onclick=${this.lang.bind(null, 'es')}>${translate.message('spanish')}</a></li>
                                    <li><a href="#" onclick=${this.lang.bind(null, 'en-US')}>${translate.message('english')}</a></li>
                                </ul>
                            </div>
                            <div class="col s4 offset-s5 offset-m6 offset-l6 right-align">© 2017 PhotoBooks</div>
                        </div>
                    </div>
                </footer>
            </div>
        `
  }

  lang (lang, event) {
    window.localStorage['locale'] = lang
    window.location.reload()
    return false
  }

  openLangDropdown (event) {
    event.preventDefault()
  }

  show (display = true) {
    let el = document.querySelector('.main-container')
    if (display) el.classList.add('display')
    else el.classList.remove('display')
  }

  update () {
    let el = document.querySelector('.main-container')
    yo.update(el, this.render())
  }

  mount () {
    let el = this.render()
    document.body.append(el)
  }
}

export default Layout
