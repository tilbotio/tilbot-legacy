define("BasicEditorProjectController", ["BasicProjectController", "GroupConnector"],
function(BasicProjectController, GroupConnector) {

  return class BasicEditorProjectController extends BasicProjectController {
    constructor() {
        super();
    }

    set_canvas_size(width, height) {

      var path = this.get_path();

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

    set_name(name) {
      this.project.name = name;
    }

    add_block(block) {

      var path = this.get_path();

      if (path.length == 0) {
        this.project.blocks[this.get_current_block_id().toString()] = block;
      }

      else {
        var b = this.project.blocks[path[0]];

        for (var i = 1; i < path.length; i++) {
          b = b.blocks[path[i]];
        }

        b.blocks[this.get_current_block_id().toString()] = block;
        
      }      

      console.log(this.project);
    }

    delete_block(block_id) {
      if (this.selected_group_blocks.length == 0) {
        delete this.project.blocks[block_id.toString()];
      }
      else {
        delete this.selected_group_blocks[this.selected_group_blocks.length-1].model.blocks[block_id.toString()];
        this.block_changed(block_id, this.selected_group_blocks[this.selected_group_blocks.length-1].model);
      }

      console.log(this.project.blocks);
    }

    delete_line(from_id, from_connector_id, target_id) {
      var path = this.get_path();

      if (path.length == 0) {
        if (this.project.blocks[from_id] !== undefined) {
          var tars = this.project.blocks[from_id].connectors[from_connector_id].targets;
    
          var index = tars.indexOf(target_id);
      
          if (index !== -1) {
            tars.splice(index, 1);
            this.project.blocks[from_id].connectors[from_connector_id].targets = tars;        
          }  
        }
      }

      else {
        var block = this.project.blocks[path[0]];

        for (var i = 1; i < path.length; i++) {
          block = block.blocks[path[i]];
        }
        
        var tars = block.blocks[from_id].connectors[from_connector_id].targets;
  
        var index = tars.indexOf(target_id);
     
        if (index !== -1) {
          tars.splice(index, 1);
          block.blocks[from_id].connectors[from_connector_id].targets = tars;        
        }  
      }
    }

    set_starting_line(val) {
      var path = this.get_path();
      
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

    block_changed(key, block) {
      // Do nothing by default.
    }

    endpoint_line_created(block_id, connector_id, description) {
      this.selected_group_blocks[this.selected_group_blocks.length-1].model.connectors.push(new GroupConnector(block_id, connector_id, description));
      this.block_changed(this.selected_group_blocks[this.selected_group_blocks.length-1].id, this.selected_group_blocks[this.selected_group_blocks.length-1].model);      
    }

    endpoint_line_deleted(block_id, connector_id) {
      for (var i = 0; i < this.selected_group_blocks[this.selected_group_blocks.length-1].model.connectors.length; i++) {
        var conn = this.selected_group_blocks[this.selected_group_blocks.length-1].model.connectors[i];
        if (conn.from_id.toString() == block_id.toString() && conn.from_connector == connector_id) {
          this.selected_group_blocks[this.selected_group_blocks.length-1].model.connectors.splice(i, 1);
          this.block_changed(this.selected_group_blocks[this.selected_group_blocks.length-1].id, this.selected_group_blocks[this.selected_group_blocks.length-1].model);
          break;
        }
      }
    }
  }
});
