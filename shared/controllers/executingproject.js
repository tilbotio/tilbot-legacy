define("ExecutingProjectController", ["BasicProjectController"],
function(BasicProjectController) {

  return class ExecutingProjectController extends BasicProjectController {
    constructor() {
        super();
        
    }

    send_message(block) {
        // Don't do anything yet. In future, call function on block controller?
    }

    check_group_exit(id, from_connector) {
        var path = this.get_path();
  
        if (id == -1) {            
          var group_block_id = path[path.length-1];
          this.move_level_up();            
  
          path = this.get_path();
  
          var block = this.project;
  
          if (path.length > 0) {
            for (var i = 0; i < path.length; i++) {
              block = block.blocks[path[i]];
            }
          }
  
          for (var i = 0; i < block.blocks[group_block_id.toString()].connectors.length; i++) {
            if (block.blocks[group_block_id.toString()].connectors[i].from_id == this.current_block_id && block.blocks[group_block_id.toString()].connectors[i].from_connector == from_connector) {
              var new_id = block.blocks[group_block_id.toString()].connectors[i].targets[0];
              this.current_block_id = group_block_id;
              this.check_group_exit(new_id, from_connector);
              break;
            }
          }
        }
  
        else {
          this.current_block_id = id;
          this._send_current_message();  
        }
    }
    
    message_sent_event() {
        // Don't do anything yet.
    }
  
    _send_current_message() {
        // Don't do anything yet. In future, something that works for all?
    }
  
    receive_message(str) {
        // Don't do anything yet. 
    }
  }
});
