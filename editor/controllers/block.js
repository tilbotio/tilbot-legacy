define("BlockController", ["jquery", "handlebars", "Observable", "LineController", "text!/editor/views/block.html"],
function($, Handlebars, Observable, LineController, view) {

  return class BlockController extends Observable {
    constructor(id, model) {
        super();

        this.lineControllers = [];

        this.id = id;
        this.model = model;
        this.model.subscribe(this);
        this.dom = undefined;

        this.selected = false;
        this.drawing_line = false;
        this.dragging = false;

        this.blockTemplate = Handlebars.compile(view);

        this.render();
        this.bindEvents();
    }

    bindEvents() {
      var self = this;

      this.dom.on('click', {self: this}, this.select_or_edit_block);

      this.dom.find('.connector_out').on('mousedown', {self: this}, this.draw_line);

      this.dom.draggable({
        start: function(event, ui){
          if (event.originalEvent.target.classList.contains('connector_out')) {
            return false;
          }

          self.select_block({target: self.dom[0], data: { self: self }});
          self.dragging = true;
          self.notifyAll('block_dragging', {val: true});
        },
        stop: function(event, ui){
          setTimeout(function() {
              self.dragging = false;
          }, 100);

          var target = $(event.target);
          self.model.setLocation(target.position().left, target.position().top);

          self.notifyAll('block_dragging', {val: false});
        },
        drag: function(event, ui) {
          if (self.drawing_line) {
            return false;
          }

          // Update any lines if needed
          $('line[data-from-block="' + self.id + '"]').each(function(index, element) {
            var connector_id = element.getAttribute('data-from-connector-id');

            var connector_pos = $(event.target).find('.connector_out[data-connector-id="' + connector_id + '"]').position();

            element.setAttribute('x1', ui.position.left + connector_pos.left + 12);
            element.setAttribute('y1', ui.position.top + connector_pos.top + 7 + 80);
          });

          $('line[data-to-block="' + self.id + '"]').each(function(index, element) {
            element.setAttribute('x2', ui.position.left + 10);
            element.setAttribute('y2', ui.position.top + 10);
          });
        }
      });
    }

    render() {
      if (this.dom !== undefined) {
        this.dom.remove();
      }

      this.dom = $(this.blockTemplate(this.model));

      this.dom.css('left', this.model.x);
      this.dom.css('top', this.model.y);

      this.dom.data('controller', this);

      $('#editor_panel').append(this.dom);

      this.select_block({target: this.dom[0], data: { self: this }});
    }

    refresh() {
      this.render();
      this.bindEvents();
    }

    select_or_edit_block(event) {
      if (event.data.self.selected) {
        event.data.self.edit_block(event);
      }
      else {
        event.data.self.select_block(event);
      }
    }

    select_block(event) {
      event.data.self.notifyAll('something_selected');

      event.data.self.selected = true;

      event.data.self.dom.removeClass('block_deselected');
    }

    edit_block(event) {
      if (!event.data.self.dragging) {
        event.data.self.notifyAll('edit_block', event.data.self.model);
      }
    }

    deselect(visual = true) {
      this.selected = false;

      if (visual) {
        this.dom.addClass('block_deselected');
      }
      else {
        this.dom.removeClass('block_deselected');
      }

      for (var l in this.lineControllers) {
        this.lineControllers[l].deselect();
      }

    }

    delete_if_selected() {
      if (this.selected) {
        this.delete();
      }
      else {
        for (var l in this.lineControllers) {
          this.lineControllers[l].delete_if_selected();
        }
      }
    }

    delete() {
      for (const [key, value] of Object.entries(this.lineControllers)) {
        value.delete();
      }

      this.dom.remove();
      this.notifyAll('block_deleted');
    }

    // Draw a line programmatically (e.g., after loading existing project)
    draw_full_line(connector_id, target_id, x2, y2) {
      var block_pos = this.dom.position();
      var container_pos = this.dom.find('.connectors').position();
      var pos = this.dom.find('.connector_out[data-connector-id=' + connector_id + ']').position();

      var line_controller = new LineController(this.id, connector_id,
        block_pos.left + container_pos.left + pos.left + 16,
        block_pos.top + container_pos.top + pos.top - 12,
        target_id,
        x2, y2);

      line_controller.subscribe(this);
      this.lineControllers.push(line_controller);
    }

    draw_line(event) {
      event.data.self.drawing_line = true;

      var block_pos = $(this).parents('.block').position();
      var container_pos = $(this).parents('.connectors').position();
      var pos = $(this).position();
      var line_controller = new LineController(event.data.self.id, parseInt($(this).attr('data-connector-id')),
        block_pos.left + container_pos.left + pos.left + 16,
        block_pos.top + container_pos.top + pos.top - 12);

      line_controller.subscribe(event.data.self);
    }

    notify(src, message, params) {

      switch(message) {
        case 'line_completed': this.line_completed(src, params); break;
        case 'line_cancelled': this.line_cancelled(); break;
        case 'line_selected': this.line_selected(); break;
        case 'line_deleted': this.line_deleted(src); break;
        case 'model_updated': this.refresh(); break;
        default: ;
      }

    }

    line_completed(src, params) {
      this.drawing_line = false;

      // This connection already exists: cancel it!
      if (this.model.connectors[params.connector_id].targets.includes(params.target)) {
        src.cancel_line();
      }

      else {
        this.lineControllers.push(src);
        this.model.connectors[params.connector_id].targets.push(params.target);

        if (params.target == -1) { // Connects to endpoint
          var label = 'completed';
          if (this.model.connectors[params.connector_id].label !== undefined) {
            label = this.model.connectors[params.connector_id].label;
          }
          this.notifyAll('endpoint_line_created', {block_id: this.id, connector_id: params.connector_id, description: this.model.name + ':' + label});
        }

        this.notifyAll('block_changed', this.model);
        this.notifyAll('update_minimap');
      }
    }

    line_cancelled() {
      this.drawing_line = false;
    }

    line_selected() {
      this.notifyAll('something_selected');
    }

    line_deleted(src) {
      this.notifyAll('line_deleted', {line: src});
      if (src.target_id == -1) {
        this.notifyAll('endpoint_line_deleted', {block_id: src.from_id, connector_id: src.from_connector_id});
        this.notifyAll('block_changed', this.model);
      }
    }

    check_delete_line(target_id) {
      for (const [key, value] of Object.entries(this.lineControllers)) {
        value.check_delete_line(target_id);
      }
    }
  }
});
