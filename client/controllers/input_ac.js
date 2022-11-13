define("InputACController", ["jquery", "handlebars", "Observable", "text!/client/views/input_ac.html"],
function($, Handlebars, Observable, view) {

  return class InputACController extends Observable {

    constructor(options = []) {
      super();

      this.template = Handlebars.compile(view);
      this.render(options);

      this.selected = '';
    }

    bindEvents() {
      $('#ac_options_show').on('click', {self: this}, this.open_options);
    }

    render(options) {
      this.dom = $(this.template({options: this.options}));
      this.dom.insertBefore($('#send_icon'));

      $('#ac_options').autocomplete({
        source: options, 
        minLength: 2,
        position: { my: "left bottom", at: "left bottom"}
      });
    }

    open_options() {
        var cur = $('#ac_options').val();

        if (cur.length < 2) {
            alert('Please enter at least two letters to receive suggestions.');
        }
        $('#ac_options').autocomplete("search", cur);
    }

    redraw(options) {
      this.selected = '';
      $('#input_ac').remove();
      this.render(options);
      this.bindEvents();
    }

    show() {
      this.dom.css('display', 'block');
    }

    hide() {
      this.dom.css('display', 'none');
    }


  }

});
