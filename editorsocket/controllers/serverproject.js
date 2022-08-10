define("ServerProjectController", ["BasicProjectController", "ProjectSchema"],
function(BasicProjectController, ProjectSchema) {

  return class ServerProjectController extends BasicProjectController {
    constructor(socket, mongoose) {
        super();

        this.socket = socket;
        this.mongoose = mongoose;
        this.modified = false;
        this.ever_modified = false;

        var self = this;

        // Accept function calls over socket.
        socket.on('cmd', function(command, params) {
            console.log(command);
            console.log(params);

            var func = self[command];
            if (Array.isArray(params)) {
                func.apply(self, params);
            }
            else {
                func.call(self, params);
            }
        });        

        // Set 10 sec timer to see if we need to save.
        this.timer = setInterval(this.save.bind(this), 10000);
    }

    get_project_from_id(id) {
      console.log('load the project!');
      console.log(id);
      var self = this;

      // No safety checks should be needed here since the user cannot get to this point without being properly authenticated.
      ProjectSchema.findOne({ id: id }).then(function(project) {
        self.project = project;
      });    
    }

    set_canvas_size(width, height) {
      console.log(width);
      console.log(height);
      super.set_canvas_size(width, height);
      this.modified = true;
      this.ever_modified = true;
    }

    set_name(name) {
      super.set_name(name);
      this.modified = true;
      this.ever_modified = true;
    }

    add_block(block) {
      super.add_block(block);
      this.modified = true;
      this.ever_modified = true;
    }

    delete_block(block_id) {
      super.delete_block(block_id);
      this.modified = true;
      this.ever_modified = true;
    }

    delete_line(from_id, from_connector_id, target_id) {
      super.delete_line(from_id, from_connector_id, target_id);
      this.project.markModified('blocks'); // This is apparently needed for mongoose to pick up on changes to an array in a Map.
      this.modified = true;
      this.ever_modified = true;
    }

    set_starting_line(val) {
      super.set_starting_line(val);
      this.modified = true;
      this.ever_modified = true;
    }

    block_changed(key, block) {
      super.block_changed(key, block);
      this.project.blocks.set(key, block);
      this.modified = true;
      this.ever_modified = true;
    }    

    save() {
      console.log('checking for save...');
      if (this.project.save !== undefined && this.modified) {
        console.log(this.project);
        console.log('saving..');
        this.project.save();
        this.modified = false;
      }      
    }

    destroy() {
      this.save();
      clearInterval(this.timer);
    }
  }
});
