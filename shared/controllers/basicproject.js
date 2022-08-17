define("BasicProjectController", ["Project"],
function(Project) {

  return class BasicProjectController {
    constructor() {
        this.project = new Project();
    }

    set_canvas_size(width, height, path = []) {

      if (path.length == 0) {
        this.project.canvas_width = width;
        this.project.canvas_height = height;  
      }

      else {
        var block = this.project.blocks[path[0]];

        for (var i = 1; i < path.length; i++) {
          console.log(block.blocks);
          block = block.blocks[path[i]];
        }

        console.log(block);
        
        block.canvas_width = width;
        block.canvas_height = height;
      }
    }

    get_current_block_id() {
      return this.project.current_block_id;
    }

    set_current_block_id(new_id) {
      this.project.current_block_id = new_id;
    }

    set_name(name) {
      this.project.name = name;
    }

    add_block(block) {
      console.log(block);
      this.project.blocks[this.get_current_block_id().toString()] = block;
    }

    delete_block(block_id) {
      delete this.project.blocks[block_id.toString()];
      console.log(this.project.blocks);
    }

    delete_line(from_id, from_connector_id, target_id) {
      console.log(this.project);
      console.log(from_id);
      console.log(from_connector_id);
      console.log(target_id);

      if (this.project.blocks[from_id] !== undefined) {
        var tars = this.project.blocks[from_id].connectors[from_connector_id].targets;
        //console.log(tars.get(0));
  
        var index = tars.indexOf(target_id);
     
        if (index !== -1) {
          tars.splice(index, 1);
          this.project.blocks[from_id].connectors[from_connector_id].targets = tars;        
        }  
      }
    }

    set_starting_line(val, path = []) {
      console.log(path);
      
      if (path.length == 0) {
        this.project.starting_block_id = val;
      }

      else {
        var block = this.project.blocks[path[0]];

        for (var i = 1; i < path.length; i++) {
          block = block.blocks[path[i]];
        }
        
        block.starting_block_id = val;
      }
    }

    load_project(json_str) {
      var self = this;
      var dfd = $.Deferred();

      $.when(Project.fromJSON(/*JSON.parse(*/json_str/*)*/)).then(function(project) {
        self.project = project;
        dfd.resolve();
      });

      return dfd.promise();
    }

    block_changed(key, block, path = []) {
      // Do nothing by default.
    }
  }
});
