/*
TODO: Añadir como servicio al inyector de dependencias ¿?
*/

class Forms {
  static serialize (form) {
    let data = {}

    for (let item of form.elements) {
      if (item.type !== 'submit') {
        data[item.name] = item.value
      }
    }

    return data
  }

  static validate (form, errorElement) {
    let valid

    for (let item of form.elements) {
      if (item.type !== 'submit') {
        item.className = ''

        if (item.validity.valid) {
          item.classList.add('valid')
        } else {
          item.classList.add('invalid')
        }
      }
    }

    if (!form.checkValidity()) {
      errorElement.classList.remove('hide')
      valid = false
    } else {
      errorElement.classList.add('hide')
      valid = true
    }

    return valid
  }
}

export default Forms
