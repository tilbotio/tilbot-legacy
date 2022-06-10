define("Project", [], function() {
    return class Project {
      constructor(canvas_width, canvas_height) {
        this.name = 'New project';
        this.current_block_id = 1;
        this.blocks = {};
        this.starting_block_id = -1;
        this.canvas_width = canvas_width;
        this.canvas_height = canvas_height;
      }

      toJSON() {
        var output = {
          name: this.name,
          current_block_id: this.current_block_id,
          blocks: {},
          starting_block_id: this.starting_block_id,
          canvas_width: this.canvas_width,
          canvas_height: this.canvas_height
        };

        for (const [key, value] of Object.entries(this.blocks)) {
          output.blocks[key] = value.toJSON();
        }

        return output;

      }

      static fromJSON(json) {
        var dfd = $.Deferred();

        var project = new Project(json.canvas_width, json.canvas_height);
        project.name = json.name;
        project.current_block_id = json.current_block_id;
        project.starting_block_id = json.starting_block_id;

        project.blocks = {};

        for (const [key, value] of Object.entries(json.blocks)) {
          require([value.type + 'Block'], function(Block) {
              $.when(Block.fromJSON(value)).then(function(block) {
                  project.blocks[key] = block;

                  if(Object.keys(project.blocks).length == Object.keys(json.blocks).length) {
                    dfd.resolve(project);
                  }

              });

          });
        }

        return dfd.promise();
      }
    }
});
