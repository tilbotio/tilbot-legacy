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

    set_canvas_size(width, height, path = []) {
      super.set_canvas_size(width, height, path);
      this.project.markModified('blocks'); // This is apparently needed for mongoose to pick up on changes to an array in a Map.
      this.modified = true;
      this.ever_modified = true;
    }

    set_current_block_id(new_id) {
      super.set_current_block_id(new_id);
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
      this.project.markModified('blocks');
      this.modified = true;
      this.ever_modified = true;
    }

    delete_block(block_id) {
      super.delete_block(block_id);
      this.project.markModified('blocks');
      this.modified = true;
      this.ever_modified = true;
    }

    delete_line(from_id, from_connector_id, target_id, path = []) {
      super.delete_line(from_id, from_connector_id, target_id, path);
      this.project.markModified('blocks'); // This is apparently needed for mongoose to pick up on changes to an array in a Map.
      this.modified = true;
      this.ever_modified = true;
    }

    set_starting_line(val, path = []) {
      super.set_starting_line(val, path);
      this.project.markModified('blocks');
      this.modified = true;
      this.ever_modified = true;
    }

    block_changed(key, block) {           
      super.block_changed(key, block);


      var path = this.get_path();

      var tmpblocks = this.project.blocks;

      if (path.length > 0) {
        for (var i = 0; i < path.length; i++) {
          tmpblocks = tmpblocks[path[i]].blocks;

          if (key in tmpblocks) {
            tmpblocks[key] = block;
            this.project.markModified('blocks');
            this.modified = true;
            this.ever_modified = true;  
            return;
          }
        }
      }
      
      for (const [k, v] of Object.entries(tmpblocks)) {
        if (k == key) {
          console.log('found the block!');
          tmpblocks[k] = block;
          this.project.markModified('blocks');
          this.modified = true;
          this.ever_modified = true;          
          return;
        }
      }      
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
