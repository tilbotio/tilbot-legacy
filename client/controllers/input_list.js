define("InputListController", ["jquery", "handlebars", "text!/client/views/input_list.html"],
function($, Handlebars, view) {

  return class InputListController {

    constructor(params = {}) {
      this.params = params;
      this.listTemplate = Handlebars.compile(view);
      this.render(params);
      this.bindEvents();
      this.selected = '';
    }

    bindEvents() {
      $('#input_select').on('change', {self: this}, this.selection_changed);
    }

    render() {
      console.log(this.params);
      this.dom = $(this.listTemplate(this.params));
      this.dom.insertBefore($('#send_icon'));
    }

    selection_changed(event) {
      var text = $(this).val();
      event.data.self.selected = text;
    }

    redraw(params) {
      this.params = params;
      this.selected = params.options[0];
      $('#input_list').remove();
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
