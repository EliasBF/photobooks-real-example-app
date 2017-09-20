import slugify from 'slugify'

function slug (text) {
  return slugify(text, {remove: /[{}[\]$#%^?¡`¿&*_+~./()='"!\-:@]/g, lower: true})
}

export default slug
