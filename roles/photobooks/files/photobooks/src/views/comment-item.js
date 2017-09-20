import yo from 'yo-yo'
import translate from '../utils/translate'

class CommentItem {
  static render (state) {
    return yo`
      <div class="card">
        <div class="card-content">
          <div style="margin:0" class="row valign-wrapper">
            <div class="col s2">
              <img src="${state.user.avatar}" alt="${state.user.userName}" class="responsive-img circle" />
            </div>
            <div style="margin-left:0" class="col s10">
              <div style="margin:0" class="row">
                <div class="col s12">
                  <span class="grey-text text-darken-3">${state.user.userName}</span>
                </div>
                <div class="col s12">
                  <span class="grey-text">${translate.date.format(new Date(state.createdAt).getTime())}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div style="margin-top:30px" class="col s12">
              <p>${state.content}</p>
            </div>
          </div>
        </div>
      </div>
    `
  }
}

export default CommentItem
