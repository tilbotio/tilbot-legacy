define("EditorProjectController", ["BasicProjectController"],
function(BasicProjectController) {

  return class EditorProjectController extends BasicProjectController {
    constructor(project_id) {
        super();

        var self = this;

        require([document.URL.substring(0, document.URL.length-38) + '/socket.io/socket.io.js'], function(io) {
            self.socket = io(document.URL.substring(0, document.URL.length-38));
    
            self.socket.emit('cmd', 'get_project_from_id', project_id);
            //self.socket.on('bot message', self.message_received.bind(self));  
        });        
    }

    set_canvas_size(width, height, path = []) {
      super.set_canvas_size(width, height, path);
      this.socket.emit('cmd', 'set_canvas_size', [width, height, path]);
    }

    set_current_block_id(new_id) {
      super.set_current_block_id(new_id);
      this.socket.emit('cmd', 'set_current_block_id', new_id);
    }

    set_name(name) {
      super.set_name(name);
      this.socket.emit('cmd', 'set_name', name);
    }

    add_block(block) {
      super.add_block(block);
      this.socket.emit('cmd', 'add_block', block);
    }

    delete_block(block_id) {
      console.log('delete block!');
      super.delete_block(block_id);
      this.socket.emit('cmd', 'delete_block', block_id);
    }

    delete_line(from_id, from_connector_id, target_id, path = []) {
      super.delete_line(from_id, from_connector_id, target_id, path);
      this.socket.emit('cmd', 'delete_line', [from_id, from_connector_id, target_id]);
    }

    set_starting_line(val, path = []) {
      super.set_starting_line(val, path);
      this.socket.emit('cmd', 'set_starting_line', [val, path]);
    }

    block_changed(key, block, path = []) {
      super.block_changed(key, block, path);
      this.socket.emit('cmd', 'block_changed', [key, block, path]);
    }
  }
});
