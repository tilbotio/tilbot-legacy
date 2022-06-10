define("InputMCController", ["jquery", "handlebars", "Observable", "text!/client/views/input_mc.html"],
function($, Handlebars, Observable, view) {

  return class InputMCController extends Observable {

    constructor(options = []) {
      super();

      this.options = options;
      this.buttonTemplate = Handlebars.compile(view);
      this.render(options);
      this.bindEvents();
      this.selected = '';
    }

    bindEvents() {
      $('.input_mc_button').on('click', {self: this}, this.button_clicked);
    }

    render() {
      this.dom = $(this.buttonTemplate({options: this.options}));
      this.dom.insertBefore($('#send_icon'));
    }

    button_clicked(event) {
      var text = $(event.target).text();

      if (event.data.self.selected == text) {
        // Double clicked -- send message
        event.data.self.notifyAll('option_selected');
      }

      else {
        //input_mc_button_selected
        event.data.self.selected = text;
        $('.input_mc_button').removeClass('input_mc_button_selected');
        $(event.target).addClass('input_mc_button_selected');
      }

    }

    redraw(options) {
      this.options = options;
      this.selected = '';
      $('#input_mc').remove();
      this.render();
      this.bindEvents();
    }

    show() {
      this.dom.css('display', 'flex');
    }

    hide() {
      this.dom.css('display', 'none');
    }


  }

});
