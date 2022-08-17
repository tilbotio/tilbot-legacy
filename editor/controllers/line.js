define("LineController", ["jquery", "handlebars", "Observable"],
function($, Handlebars, Observable) {

  return class LineController extends Observable {
    constructor(from_id, from_connector_id, x, y, target_id = undefined, x2 = undefined, y2 = undefined) {
        super();

        this.from_id = from_id;
        this.from_connector_id = from_connector_id;
        this.target_id = target_id;
        this.dom = undefined;
        this.dom_clickable = undefined;

        this.current_mouse_x = undefined;
        this.current_mouse_y = undefined;

        this.selected = false;

        this.render(x, y);

        if (x2 == undefined || y2 == undefined) {
          this.bindEvents();
        }
        else if (x2 !== undefined && y2 !== undefined) {
          this.dom.setAttribute('x2', x2 + 10);
          this.dom.setAttribute('y2', y2 + 10);
          this.dom.setAttribute('data-to-block', target_id);

          this.dom_clickable.setAttribute('x2', x2 + 10);
          this.dom_clickable.setAttribute('y2', y2 + 10);
          this.dom_clickable.setAttribute('data-to-block', target_id);
          this.dom_clickable.classList.remove('connector-drawing');
          $(this.dom_clickable).on('click', {self: this}, this.line_clicked);
        }
    }

    bindEvents() {
      $('#editor_panel').on('mousemove', { self: this }, this.mouse_moved);
      $('#editor_panel').on('mouseup', { self: this }, this.mouse_up);
    }

    render(x, y) {

      // We cannot use an HTML template for this one.
      // Create the actual line
      this.dom = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      this.dom.setAttribute('x1', x);
      this.dom.setAttribute('y1', y);
      this.dom.setAttribute('x2', x);
      this.dom.setAttribute('y2', y);
      this.dom.setAttribute('data-from-block', this.from_id);
      this.dom.setAttribute('data-from-connector-id', this.from_connector_id);
      this.dom.setAttribute('class', 'connector-solid');

      $('#connector_lines')[0].appendChild(this.dom);

      // Create a broader, clickable 'hotspot' line
      this.dom_clickable = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      this.dom_clickable.setAttribute('x1', x);
      this.dom_clickable.setAttribute('y1', y);
      this.dom_clickable.setAttribute('x2', x);
      this.dom_clickable.setAttribute('y2', y);
      this.dom_clickable.setAttribute('class', 'connector-clickable');
      this.dom_clickable.setAttribute('data-from-block', this.from_id);
      this.dom_clickable.setAttribute('data-from-connector-id', this.from_connector_id);
      this.dom_clickable.classList.add('connector-drawing');

      $('#connector_lines')[0].appendChild(this.dom_clickable);
    }

    mouse_moved(event) {
      event.data.self.current_mouse_x = event.pageX;
      event.data.self.current_mouse_y = event.pageY;

      event.data.self.draw_and_check_scrolling();
    }

    draw_and_check_scrolling() {
      var self = this;

      var solid = this.dom;
      var clickable = this.dom_clickable;

      solid.setAttribute('x2', $('#editor_container').scrollLeft() + this.current_mouse_x);
      solid.setAttribute('y2', $('#editor_container').scrollTop() + this.current_mouse_y);

      clickable.setAttribute('x2', $('#editor_container').scrollLeft() + this.current_mouse_x);
      clickable.setAttribute('y2', $('#editor_container').scrollTop() + this.current_mouse_y);


      var check_again = false;

      if ($('#editor_container').width() - this.current_mouse_x < 20) {
        $('#editor_container').scrollLeft($('#editor_container').scrollLeft() + 20);
        check_again = true;
      }
      else if (this.current_mouse_x < 20) {
        $('#editor_container').scrollLeft($('#editor_container').scrollLeft() - 20);
        check_again = true;
      }
      if ($('#editor_container').height() - this.current_mouse_y < 20) {
        $('#editor_container').scrollTop($('#editor_container').scrollTop() + 20);
        check_again = true;
      }
      else if (this.current_mouse_y < 100) {
        $('#editor_container').scrollTop($('#editor_container').scrollTop() - 20);
        check_again = true;
      }

      if (check_again) {
        setTimeout(function() { self.draw_and_check_scrolling() }, 100);
      }
    }

    mouse_up(event) {
      $('#editor_panel').off('mousemove');
      $('#editor_panel').off('mouseup');

      // Check if we landed on another block
      var el = document.elementFromPoint(event.pageX, event.pageY);

      if ($(el).attr('id') == 'end_point' || el.classList.contains('block') || $(el).parents('.block').length) {
        if (el.classList.contains('block')) {
          var theblock = $(el);
        }
        else if ($(el).attr('id') == 'end_point') {
          var theblock = $(el).parent();
        }
        else {
          var theblock = $($(el).parents('.block')[0]);
        }

        event.data.self.target_id = -1;

        if (el.classList.contains('block') || $(el).parents('.block').length) {
          event.data.self.target_id = theblock.data('controller').id;
        }

        if (event.data.self.target_id == event.data.self.from_id) {
          event.data.self.cancel_line();
          return;
        }

        // Make the connection
        var solid = event.data.self.dom;
        var clickable = event.data.self.dom_clickable;

        solid.setAttribute('x2', theblock.position().left + 10);
        solid.setAttribute('y2', theblock.position().top + 10);
        solid.setAttribute('data-to-block', event.data.self.target_id);

        clickable.setAttribute('x2', theblock.position().left + 10);
        clickable.setAttribute('y2', theblock.position().top + 10);
        clickable.setAttribute('data-to-block', event.data.self.target_id);
        clickable.classList.remove('connector-drawing');

        // Assign the click event
        $(clickable).on('click', {self: event.data.self}, event.data.self.line_clicked);

        // Broadcast to block, who will broadcast to editor
        event.data.self.notifyAll('line_completed', {connector_id: event.data.self.from_connector_id, target: event.data.self.target_id});
      }

      else {
        // Delete line
        event.data.self.cancel_line();
      }
    }

    cancel_line() {
      $(this.dom).remove();
      $(this.dom_clickable).remove();
      this.notifyAll('line_cancelled');
    }

    line_clicked(event) {
      event.data.self.notifyAll('line_selected');
      event.data.self.selected = true;

      $(event.data.self.dom).addClass('connector_selected');
    }

    delete_if_selected() {
      if (this.selected) {
        this.delete();
      }
    }

    check_delete_line(target_id) {
      if (this.target_id == target_id) {
        this.delete();
      }
    }

    delete() {
      $(this.dom).remove();
      $(this.dom_clickable).remove();
      this.notifyAll('line_deleted');
    }

    deselect() {
      $(this.dom).removeClass('connector_selected');
      this.selected = false;
    }
  }
});
