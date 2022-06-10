define("MinimapController", ["jquery", "handlebars", "html2canvas", "Observable", "text!/editor/views/minimap.html"],
function($, Handlebars, html2canvas, Observable, view) {

  return class MinimapController extends Observable {
    constructor() {
        super();

        this.dom = undefined;
        this.block_dragging = false;

        this.minimapTemplate = Handlebars.compile(view);

        this.render();
        this.bindEvents();
    }

    bindEvents() {
      this.dom.on('mousedown', { self: this }, this.mouse_down);
      this.dom.on('mouseup', { self: this }, this.mouse_up);

      $('#minimap').draggable({
        drag: function(event, ui) { return false; }
      });
    }

    render() {
      this.dom = $(this.minimapTemplate());
      $('#editor_container').append(this.dom);
    }

    mouse_down(event) {
      event.data.self.dom.on('mousemove', { self: event.data.self }, event.data.self.mouse_moved);
    }

    mouse_up(event) {
      event.data.self.dom.off('mousemove');
    }

    mouse_moved(event) {
      if (event.data.self.block_dragging) {
        return;
      }

      var x = event.pageX - $('#minimap').position().left;
      var y = event.pageY - $('#minimap').position().top;

      event.data.self.notifyAll('scroll_editor', {
        left: (x - $('#minimap_selection').width() / 2) / $('#minimap').width() * $('#editor_panel').width(),
        top: (y - $('#minimap_selection').height() / 2) / $('#minimap').height() * $('#editor_panel').height()
      });
    }

    set_block_dragging(val) {
      this.block_dragging = val;
    }

    update_minimap() {
      // Create a copy of the div so we can make it smaller for making a screenshot
      // This works to avoid iOS technical limitations
      var scale = 2000 / $('#editor_panel').width();
      var divclone = $('#editor_panel').clone();
      divclone.css('transform', 'scale(' + Math.min(1, Math.round(scale * 100) / 100) + ')');
      divclone.css('position', 'fixed');
      divclone.css('z-index', '-1');
      divclone.find('#editor_panel_gradient').hide();

      $('#editor_container').append(divclone);

      html2canvas(divclone[0]).then(canvas => {
        $('#minimap_content').html(canvas);
        divclone.remove();
      });
    }

    update_minimap_selection() {
      var left = $('#editor_container').scrollLeft() / $('#editor_panel').width() * $('#minimap').width();
      var top = $('#editor_container').scrollTop() / $('#editor_panel').height() * $('#minimap').height();
      $('#minimap_selection').css('left', left + 'px');
      $('#minimap_selection').css('top', top + 'px');
      $('#minimap_selection').css('width', $('#editor_container').width() / $('#editor_panel').width() * $('#minimap').width() + 'px');
      $('#minimap_selection').css('height', $('#editor_container').height() / $('#editor_panel').height() * $('#minimap').height() + 'px');
    }

  }
});
