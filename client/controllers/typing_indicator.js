define("TypingIndicatorController", ["jquery", "handlebars", "text!/client/views/typing_indicator.html"],
function($, Handlebars, view) {

  return class TypingIndicatorController {

    constructor() {
      this.typingTemplate = Handlebars.compile(view);
      this.render();
      this.bindEvents();
    }

    bindEvents() {

    }

    render() {
      this.dom = $(this.typingTemplate());
      this.dom.insertAfter($('#messages'));
    }

    show() {
      this.dom.show();
    }

    hide() {
      this.dom.hide();
    }

    set_avatar_image(avatar_image) {
      $('#typing_avatar').attr('src', avatar_image);
    }

  }

});
