import View from '../utils/view'
import Forms from '../utils/forms'
import translate from '../utils/translate'

class SignIn extends View {
  constructor (userStore) {
    super()
    this.userStore = userStore
  }

  template (render) {
    return render`
    <div class="container page" id="signup">
      <div class="row">
        <div class="col m4 offset-m1 hide-on-small-only">
          <img class="responsive-img" src="/images/iphone.png" />
        </div>
        <div class="col s12 m5 offset-m1">
          <div class="row">
            <div class="col s12">
              <h1>Photobooks</h1>
              <form id="event-submit" novalidate>
                <p class="flow-text">${translate.message('signup.heading')}</p>
                <div class="divider"></div>
                <div class="section">
                  <input type="text" name="fullName" placeholder="${translate.message('fullname')}" required />
                  <input type="text" name="userName" placeholder="${translate.message('username')}" required />
                  <input type="password" name="password" placeholder="${translate.message('password')}" required />
                  <button class="btn waves-effect waves-light" type="submit">${translate.message('signup.button')}</button>
                </div>
                <div id="form-error" class="card-panel red darken-4 hide">
                  <span class="white-text">${translate.message('form.error')}</span>
                </div>
              </form>
            </div>
            <div class="col s12">
            ${translate.message('signup.have-account')} <a href="/signin">${translate.message('signin')}</a>
            </div> 
          </div>
        </div>
      </div>
    </div>
    `
  }

  async onSubmit (event) {
    event.preventDefault()

    let form = event.target
    let error = form.querySelector('#form-error')

    if (Forms.validate(form, error)) {
      await this.userStore.save(Forms.serialize(form))

      // Se emite el evento userStore:signup y es manejado en ../app.js
      form.reset()
    }
  }

  async show (container, params) {
    if (!this.isReady) {
      this.configure(this.template, null, {
        'form-submit': {
          target: 'event-submit',
          eventName: 'submit',
          handler: this.onSubmit,
          context: this
        }
      })

      await this.display(container, params)
      return
    }

    await this.display(container, params)
  }
}

export default SignIn
