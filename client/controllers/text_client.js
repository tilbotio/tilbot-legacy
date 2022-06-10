define("TextClientController", ["jquery", "handlebars", "text!/client/views/text_client.html"],
function($, Handlebars, view) {

  return class TextClientController {

    constructor(params) {
      this.params = params;

      this.textClientTemplate = Handlebars.compile(view);
      this.render();
      this.bindEvents();
    }

    bindEvents() {

    }

    render() {
      $('#messages').append(this.textClientTemplate(this.params));
    }

  }

});
