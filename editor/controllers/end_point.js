define("EndPointController", ["jquery", "handlebars", "Observable", "LineController", "text!/editor/views/end_point.html"],
function($, Handlebars, Observable, LineController, view) {

  return class EndPointController extends Observable {
    constructor() {
        super();

        this.dom = undefined;
        this.startTemplate = Handlebars.compile(view);
        this.lineController = undefined;

        this.render();
        this.bindEvents();
    }

    bindEvents() {
      this.dom.draggable({
        drag: function(event, ui) { return false; }
      });
      this.dom.on('mousedown', {self: this}, this.draw_line);
    }

    render() {
      this.dom = $(this.startTemplate(this.model));
      $('#editor_panel').append(this.dom);
    }

    draw_line(event) {
      event.preventDefault();
      var pos = event.data.self.dom.position();

      var line_controller = new LineController(-1, -1, pos.left + 16, pos.top + 34);
      line_controller.subscribe(event.data.self);
    }

    // Draw a line programmatically (e.g., after loading existing project)
    draw_full_line(starting_block_id, x2, y2) {
      var starting_pos = this.dom.position();
      this.lineController = new LineController(-1, -1, starting_pos.left + 16, starting_pos.top + 34, starting_block_id, x2, y2);
      this.lineController.subscribe(this);
    }

    notify(src, message, params) {

      switch(message) {
        case 'line_completed': this.line_completed(src, params); break;
        case 'line_selected': this.line_selected(); break;
        case 'line_deleted': this.line_deleted(src); break;
        default: ;
      }

    }

    line_completed(src, params) {
      this.lineController = src;
      this.dom.off('mousedown');
      this.notifyAll('starting_line_created', {target: params.target});
    }

    line_selected() {
      this.notifyAll('something_selected');
    }

    deselect() {
      if (this.lineController !== undefined) {
        this.lineController.deselect();
      }
    }

    line_deleted(src) {
      this.lineController = undefined;
      this.bindEvents();
      this.notifyAll('starting_line_deleted');
    }

    check_delete_line(target_id = undefined) {
      if (this.lineController !== undefined) {
        if (target_id === undefined) {
          this.lineController.delete_if_selected();
        }
        else {
          this.lineController.check_delete_line(target_id);
        }

      }

    }

    set_canvas_size(width, height) {
        this.dom.css('top', parseInt(height)-128 + 'px');
        this.dom.css('left', parseInt(width)-128 + 'px');
    }
  }
});
