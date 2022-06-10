define("TextServerController", ["jquery", "handlebars", "text!/client/views/text_server.html"],
function($, Handlebars, view) {

  return class TextServerController {

    constructor(params) {
      this.params = params;

      this.textServerTemplate = Handlebars.compile(view);
      this.render();
      this.bindEvents();
    }

    bindEvents() {

    }

    render() {
      $('#messages').append(this.textServerTemplate(this.params));
    }

  }

});
