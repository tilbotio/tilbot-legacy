define("EditorController", ["jquery", "handlebars", "Util", "StartingPointController", "MinimapController", "NewBlockController", "EditBlockController", "BlockController", "BasicProjectController", "text!/editor/views/editor.html"],
function($, Handlebars, Util, StartingPointController, MinimapController, NewBlockController, EditBlockController, BlockController, ProjectController, view) {

  return class EditorController {

    constructor() {

      var urlparts = document.URL.split('/');
      this.project_id = urlparts[urlparts.length-1];

      if (this.project_id.length != 32) {
        window.location.href = '/login/';
      }

      this.blockControllers = {};
      this.block_dragging = false;

      // @TODO: load Project based on URL
      this.projectController = new ProjectController();

      var self = this;

      // @TODO: active/inactive projects
      $.get('/api/get_project', { id: this.project_id }, function(data) {
        console.log(data);
        if (data == 'NOK') {
          window.location.href = '/login/';
        }
        else {
          require(['jqueryui'], function() {
            require(['jqueryuitouch'], function() {
              self.editorTemplate = Handlebars.compile(view);
              self.render();
  
              self.editBlockController = new EditBlockController();
              self.editBlockController.subscribe(self);
              self.newBlockController = new NewBlockController();
              self.newBlockController.subscribe(self);
  
              self.startingPointController = new StartingPointController();
              self.startingPointController.subscribe(self);
  
              self.minimapController = new MinimapController();
              self.minimapController.subscribe(self);
  
              self.load_project(self, data);
              //self.projectController.set_canvas_size($('#editor_panel').width(), $('#editor_panel').height());
  
              self.bindEvents();
            });
          });
        }
      });



    }

    bindEvents() {
      $('#new_block_button').on('click', { self: this }, this.show_popup_new_block);
      $('#overlay').on('click', { self: this }, this.close_overlay);
      $('#editor_panel').on('click', { self: this }, this.editor_clicked);
      $('#editor_container').on('scroll', { self: this }, this.panel_scrolling);
      $('#btn_export').on('click', { self: this }, this.export_project);
      $('#btn_import').on('click', { self: this }, this.import_project);
      $('#jsonfileinput').on('change', { self: this}, this.import_project_file);

      $('#btn_edit_title').on('click', { self: this, val: true }, this.make_title_editable);
      $('#btn_save_title').on('click', { self: this }, this.save_title);
      $('#project_title').on('keydown keyup paste', { limit: 42 }, Util.check_char_limit);

      $('#btn_run_all').on('click', { self: this }, this.run_all);
      $('#btn_run_selected').on('click', { self: this }, this.run_selected);

      $(document).on('keydown', { self: this }, this.key_down);
    }

    render() {
      $('#editor_container').append(this.editorTemplate(this.projectController.project));
    }

    // Callback for observed objects (e.g., blocks, lines)
    notify(src, message, params) {

      switch(message) {
        case 'something_selected': this.deselect_all(); break;
        case 'edit_block': this.show_popup_edit_block(params); break;
        case 'block_dragging': this.dragging_block(src, params.val); break;
        case 'block_deleted': this.delete_block(src); break;
        case 'line_deleted': this.delete_line(params.line); break;
        case 'starting_line_created': this.starting_line_created(params.target); break;
        case 'starting_line_deleted': this.starting_line_deleted(); break;
        case 'popup_closed': this.close_overlay(); break;
        case 'new_block_added': this.add_new_block(params.block); break;
        case 'update_minimap': this.minimapController.update_minimap(); break;
        case 'scroll_editor': this.scroll_editor(params); break;
        default: ;
      }

    }

    show_popup_new_block(event) {
      console.log(event.data.self.projectController.project);
      $('#overlay').show();
      event.data.self.newBlockController.show();
    }

    show_popup_edit_block(model) {
      $('#overlay').show();
      this.editBlockController.show(model);
    }

    close_overlay(event = undefined) {
      var self = this;

      if (event !== undefined) {
        self = event.data.self;
      }

      self.newBlockController.hide();
      self.editBlockController.hide();

      $('#overlay').hide();
    }

    add_new_block(block) {
      this.close_overlay();

      // Update default name
      block.name = 'Block ' + this.projectController.get_current_block_id();

      block.x = $('#editor_container').scrollLeft() + $('#editor_container').width() / 2;
      block.y = $('#editor_container').scrollTop() + $('#editor_container').height() / 2;


      // Add model to collection
      this.projectController.add_block(block);

      // Create controller with actual template
      this.blockControllers[this.projectController.get_current_block_id()] = new BlockController(this.projectController.get_current_block_id(), block);
      this.blockControllers[this.projectController.get_current_block_id()].subscribe(this);

      // Increment current block number
      this.projectController.set_current_block_id(this.projectController.get_current_block_id() + 1);

      // Update minimap
      this.minimapController.update_minimap();
    }

    deselect_all() {
      for (const [key, value] of Object.entries(this.blockControllers)) {
        value.deselect(true);
      }

      var self = this;

      setTimeout(function() {
        self.minimapController.update_minimap();
      }, 50);
    }

    dragging_block(src, val) {
      this.block_dragging = val;
      this.minimapController.set_block_dragging(val);

      if (!val) {
        this.check_resize_canvas();
        this.minimapController.update_minimap();
      }
    }

    no_selection() {
      for (const [key, value] of Object.entries(this.blockControllers)) {
        value.deselect(false);
      }

      this.startingPointController.deselect();
      this.minimapController.update_minimap();
    }

    editor_clicked(event) {
      if ($('#project_title').attr('contenteditable')) {
          event.data.self.save_title();
      }

      if ($(event.target).attr('id') == 'editor_panel') {
        event.data.self.no_selection();
      }
    }

    key_down(event) {
      if (event.keyCode == 46) { // Delete
        event.data.self.delete_selected();
      }
      else if (event.keyCode == 13) { // Enter
        if ($('#project_title').attr('contenteditable')) {
            event.data.self.save_title();
            event.preventDefault();
        }
        else {
          // Check if maybe the edit pop-up needs to save title
          event.data.self.editBlockController.check_enter_pressed(event);
        }
      }
    }

    delete_selected() {
      this.startingPointController.check_delete_line();

      for (const [key, value] of Object.entries(this.blockControllers)) {
        value.delete_if_selected();
      }
    }

    delete_block(block) {
      this.startingPointController.check_delete_line(block.id);

      for (const [key, value] of Object.entries(this.blockControllers)) {
        value.check_delete_line(block.id);
      }

      delete this.blockControllers[block.id];
      this.projectController.delete_block(block.id);

      this.no_selection();
      this.minimapController.update_minimap();
    }

    delete_line(line) {
      this.projectController.delete_line(line);
      this.no_selection();
      this.minimapController.update_minimap();
    }

    panel_scrolling(event) {
      var canvas = $(this).find('#editor_panel');

      if (event.data.self.block_dragging) {

        if ((canvas.height() - $(this).height() - $(this).scrollTop()) < 120) {
          canvas.css('height', canvas.height() + 120 + 'px');
        }

        if ((canvas.width() - $(this).width() - $(this).scrollLeft()) < 200) {
          canvas.css('width', canvas.width() + 200 + 'px');
        }

        var drag_block = $('.ui-draggable-dragging');
        if (drag_block.position().left < $(this).scrollLeft()) {
          $(this).scrollLeft($(this).scrollLeft() - 20);
          drag_block.css('left', drag_block.position().left - 20 + 'px');
        }

        else if (drag_block.position().left + drag_block.width() > $(this).scrollLeft() + $(this).width()) {
          $(this).scrollLeft($(this).scrollLeft() + 20);
          drag_block.css('left', drag_block.position().left + 20 + 'px');
        }

        if (drag_block.position().top < $(this).scrollTop()) {
          $(this).scrollTop($(this).scrollTop() - 20);
          drag_block.css('top', drag_block.position().top - 20 + 'px');
        }

        else if (drag_block.position().top + drag_block.height() > $(this).scrollTop() + $(this).height()) {
          $(this).scrollTop($(this).scrollTop() + 20);
          drag_block.css('top', drag_block.position().top + 20 + 'px');
        }
      }

      event.data.self.minimapController.update_minimap_selection();
    }

    check_resize_canvas() {
      var most_bottom = 0;
      var most_right = 0;

      $('.block').each(function() {
        var right = $(this).position().left + $(this).width() + 200;
        var bottom = $(this).position().top + $(this).height() + 120;

        if (right > most_right) {
          most_right = right;
        }

        if (bottom > most_bottom) {
          most_bottom = bottom;
        }
      });

      var default_width = $('#editor_container').width() * 2;
      var default_height = $('#editor_container').height() * 2;

      var new_width = Math.max(default_width, most_right);
      var new_height = Math.max(default_height, most_bottom);

      this.projectController.set_canvas_size(new_width, new_height);

      $('#editor_panel').css('width', new_width + 'px');
      $('#editor_panel').css('height', new_height + 'px');

      this.minimapController.update_minimap_selection();
    }

    starting_line_created(target) {
      this.projectController.set_starting_line(target);
      this.minimapController.update_minimap();
    }

    starting_line_deleted() {
      this.projectController.set_starting_line(-1);
      this.minimapController.update_minimap();
    }

    // Source: https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
    export_project(event) {
      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(event.data.self.projectController.project.toJSON()));
      var downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",     dataStr);
      downloadAnchorNode.setAttribute("download", "project.json"); // @TODO: name based on project name?
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }

    load_project(self, json, send_to_server = false) {
      console.log(json);
      $.when(self.projectController.load_project(json)).then(function() {
        var project = self.projectController.project;
        $('#editor_panel').css('width', project.canvas_width + 'px');
        $('#editor_panel').css('height', project.canvas_height + 'px');
        $('#project_title').text(project.name);

        // Add block visuals
        for (const [key, value] of Object.entries(project.blocks)) {
          self.blockControllers[key] = new BlockController(key, value);
          self.blockControllers[key].subscribe(self);
        }

        // Add line to starting point
        if (project.starting_block_id != -1) {
          self.startingPointController.draw_full_line(project.starting_block_id, project.blocks[project.starting_block_id].x, project.blocks[project.starting_block_id].y);
        }

        // Add lines connecting to other blocks
        for (const [key, value] of Object.entries(project.blocks)) {
          for (const [ckey, cvalue] of Object.entries(value.connectors)) {
            for (const [tkey, tvalue] of Object.entries(cvalue.targets)) {
                self.blockControllers[key].draw_full_line(ckey, tvalue, project.blocks[tvalue].x, project.blocks[tvalue].y);
            }
          }
        }

        // Update minimap
        self.minimapController.update_minimap();

        self.no_selection();

        if (send_to_server) {
          console.log(self.projectController.project);
          console.log(JSON.stringify(self.projectController.project.toJSON()));

          // Upload the imported project to the database
          $.post('/api/import_project',
          {
            project: JSON.stringify(self.projectController.project.toJSON()),
            project_id: self.project_id
          },
          function(res) {
            console.log(res);
          });          
        }
      });

    }

    // Source: https://stackoverflow.com/questions/793014/jquery-trigger-file-input
    import_project(event) {
      $('#jsonfileinput').trigger('click');
    }

    // Source: https://stackoverflow.com/questions/23344776/how-to-access-data-of-uploaded-json-file
    import_project_file(event) {
      if (event.target.files[0] !== undefined) {
        var reader = new FileReader();
        reader.onload = function(load_event) {
          // @TODO: empty canvas first before loading?

          event.data.self.load_project(event.data.self, JSON.parse(load_event.target.result), true);        
        };

        reader.readAsText(event.target.files[0]);
      }
    }

    make_title_editable(event) {
      $('#project_title').attr('contenteditable', event.data.val);

      if (event.data.val) {
        $('#btn_edit_title').hide();
        $('#btn_save_title').show();
        $('#project_title').focus();
        Util.setEndOfContenteditable($('#project_title')[0]);
      }

      else {
        $('#btn_edit_title').show();
        $('#btn_save_title').hide();
        $('#project_title').blur();
      }
    }

    save_title(event = undefined) {
      var self = this;

      if (event !== undefined) {
        self = event.data.self;
      }

      self.projectController.set_name($('#project_title').text());
      self.make_title_editable({data: {val: false}});
    }

    scroll_editor(params) {
      $('#editor_container').scrollLeft(params.left);
      $('#editor_container').scrollTop(params.top);
    }

    run_all(event) {
      $('#simulator')[0].contentWindow.postMessage(JSON.stringify(event.data.self.projectController.project.toJSON()), "*");
    }

    run_selected(event) {
      var selected_id = -1;

      // Check blocks or lines
      for (var b in event.data.self.blockControllers) {
        if (event.data.self.blockControllers[b].selected) {
          selected_id = event.data.self.blockControllers[b].id;
          break;
        }
        else {
          for (var l in event.data.self.blockControllers[b].lineControllers) {
            if (event.data.self.blockControllers[b].lineControllers[l].selected) {
              selected_id = event.data.self.blockControllers[b].lineControllers[l].target_id;
              break;
            }
          }
        }
      }

      if (selected_id == -1) {
        event.data.self.run_all(event);
      }
      else {
        var project = event.data.self.projectController.project.toJSON();
        project.starting_block_id = selected_id;
        $('#simulator')[0].contentWindow.postMessage(JSON.stringify(project), "*");
      }
    }

  }

});
