define("BasicProjectController", ["Project"],
function(Project) {

  return class BasicProjectController {
    constructor() {
        this.project = new Project();
    }

    set_canvas_size(width, height) {
      this.project.canvas_width = width;
      this.project.canvas_height = height;
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
      this.project.blocks[this.get_current_block_id()] = block;
    }

    delete_block(block_id) {
      delete this.project.blocks[block_id];
      console.log(this.project.blocks);
    }

    delete_line(line) {
      var tars = this.project.blocks[line.from_id].connectors[line.from_connector_id].targets;


      var index = tars.indexOf(line.target_id);
      if (index !== -1) {
        tars.splice(index, 1);
      }
    }

    set_starting_line(val) {
      this.project.starting_block_id = val;
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
  }
});
