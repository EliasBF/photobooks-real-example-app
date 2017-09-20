import yo from 'yo-yo'

class PhotoItem {
  render (state) {
    return yo`
      <a href="/${state.user.userName}/photo/${state.publicId}">
        <div class="card grey-text text-lighten-1">
          <div class="card-image">
            <img src="/${state.url}">
          </div>
          <div class="card-content">
            <div class="row">
              <div class="col s12">
                <h5 class="grey-text text-darken-3">${state.title}</h5>
              </div>
            </div>
            <div style="margin:0" class="row">
              <a class="valign-wrapper" href="/${state.user.userName}/album/${state.album.name}">
                <div class="col s3">
                  <img src="${state.user.avatar}" alt="${state.user.fullName}" class="responsive-img circle" />
                </div>
                <div class="col s9">
                  <div style="margin:0" class="row">
                    <div class="col s12">
                      <small class="grey-text text-darken-3">${state.user.fullName}</small>
                    </div>
                    <div class="col s12">
                      <small class="grey-text">${state.album.title}</small>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </a>
    `
  }
}

export default PhotoItem
