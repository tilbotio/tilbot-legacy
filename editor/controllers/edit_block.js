define("EditBlockController", ["jquery", "handlebars", "Util", "Observable", "text!/editor/views/edit_block_container.html", "text!/editor/views/edit_block.html"],
function($, Handlebars, Util, Observable, view, subview) {

  return class EditBlockController extends Observable {
    constructor() {
        super();

        this.editblockContainerTemplate = Handlebars.compile(view);
        this.editblockTemplate = Handlebars.compile(subview);

        this.dom = undefined;
        this.current_block = undefined;

        this.render();
        this.bindEvents();
    }

    bindEvents() {
      this.dom.draggable();
      this.dom.on('click', { self: this }, this.popup_clicked);
    }

    render() {
      this.dom = $(this.editblockContainerTemplate());
      $('#editor_container').append(this.dom);
    }

    show(id, block) {
      this.current_id = id;
      this.current_block = block;
      this.dom.html(this.editblockTemplate(block));

      // Bind events of this new editblockTemplate
      $('#btn_edit_block_name').on('click', { self: this, val: true }, this.make_name_editable);
      $('#btn_save_block_name').on('click', { self: this, val: false }, this.make_name_editable);
      $('#edit_popup_title').on('keydown keyup paste', { limit: 24 }, Util.check_char_limit);
      $('#btn_edit_block_confirm').on('click', { self: this }, this.save);

      var self = this;

      // Add editable properties
      require(this.current_block.templates, function() {
        for (var i = 0; i < arguments.length; i++) {
          var template = Handlebars.compile(arguments[i]);
          $('#edit_popup_content').append(template(self.current_block));
        }

      });

      this.dom.show("scale", 250, function() {
        // Animation complete.
      });
    }

    hide() {
      this.dom.hide("scale", 250, function() {
        // Animation complete.
      });
    }

    check_enter_pressed(event) {
      if ($('#edit_popup_title').attr('contenteditable') == 'true') {
        this.make_name_editable({data: {self: this, val: false}});
        event.preventDefault();
      }
    }

    make_name_editable(event) {
      $('#edit_popup_title').attr('contenteditable', event.data.val);

      if (event.data.val) {
        event.data.self.dom.draggable('disable');
        $('#btn_edit_block_name').hide();
        $('#btn_save_block_name').show();
        $('#edit_popup_title').focus();
        Util.setEndOfContenteditable($('#edit_popup_title')[0]);
      }

      else {
        event.data.self.dom.draggable();
        $('#btn_edit_block_name').show();
        $('#btn_save_block_name').hide();
        $('#edit_popup_title').blur();
      }
    }

    popup_clicked(event) {
      if ($(event.target).attr('id') !== 'btn_edit_block_name' && $('#edit_popup_title').attr('contenteditable')) {
          event.data.self.make_name_editable({data: {self: event.data.self, val: false}});
      }
    }

    save(event) {
      // @TODO: do properly
      $('[data-field]').each(function() {
        if ($(this).attr('data-conversion') == 'array') {
          event.data.self.current_block[$(this).attr('data-field')] = $(this).val().split(';');
        }
        else if ($(this).attr('type') == 'checkbox') {
          event.data.self.current_block[$(this).attr('data-field')] = $(this).is(':checked');
        }
        else {
          event.data.self.current_block[$(this).attr('data-field')] = $(this).val();
        }
      });

      $('[data-edit-connector-id]').each(function() {

        if ($(this).attr('data-edit-connector-id') >= event.data.self.current_block.connectors.length) {
            event.data.self.current_block.new_connector();
        }
        event.data.self.current_block.connectors[$(this).attr('data-edit-connector-id')][$(this).attr('data-edit-connector-field')] = $(this).val();
      });

      // @TODO: delete removed connectors (do this after adding new ones to avoid ID mix-up)

      event.data.self.current_block.setName($('#edit_popup_title').text());

      // Perhaps a bit inefficient, but we assume if the save button is pressed that something has changed and therefore we update this block on the server.
      event.data.self.notifyAll("block_changed", {id: event.data.self.current_id, model: event.data.self.current_block});

      event.data.self.notifyAll("popup_closed");
    }

  }

});
