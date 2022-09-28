define("SocketProjectController", ["ExecutingProjectController"], function(ExecutingProjectController) {

    return class SocketProjectController extends ExecutingProjectController {
  
      constructor(io, project, socket_id) {
        super();
        
        this.io = io;
        this.project = project;
        this.socket_id = socket_id;
        this.current_block_id = this.project.starting_block_id;

        this._send_current_message();
      }      
      
      send_message(block) {
        var params = {};
  
        if (block.type == 'MC') {
          params.options = [];
          for (var c in block.connectors) {
            params.options.push(block.connectors[c].label);
          }

          this.io.to(this.socket_id).emit('bot message', {type: block.type, content: block.content, params: params});
        }
        else if (block.type == 'List') {
          params.options = block.items;
          params.text_input = block.text_input;
          params.number_input = block.number_input;

          this.io.to(this.socket_id).emit('bot message', {type: block.type, content: block.content, params: params});
        }
        else if (block.type == 'Group') {
            this.move_to_group({id: this.current_block_id, model: block});
            this.current_block_id = block.starting_block_id;
            this.send_message(block.blocks[block.starting_block_id]);
        }
        else {
            this.io.to(this.socket_id).emit('bot message', {type: block.type, content: block.content, params: params});
        }        
      }
  
      message_sent_event() {
        var path = this.get_path();
  
        if (path.length == 0) {
          if (this.project.blocks[this.current_block_id.toString()].type == 'Auto') {
            this.current_block_id = this.project.blocks[this.current_block_id.toString()].connectors[0].targets[0];
            this._send_current_message();
          }  
        }
  
        else {
          var block = this.project.blocks[path[0]];
  
          for (var i = 1; i < path.length; i++) {
            block = block.blocks[path[i]];
          }
  
          if (block.blocks[this.current_block_id.toString()].type == 'Auto') {
            var new_id = block.blocks[this.current_block_id.toString()].connectors[0].targets[0];
            this.check_group_exit(new_id, 0);
          }                  
        }      
      }

      /*message_sent_event() {
        // Log
        //this.clients[socket_id].messages.push(new Models.Message({message: this.project.blocks[this.clients[socket_id].current_block_id].content, source: 'bot'}));
        //this.clients[socket_id].save();
  
        if (this.project.blocks[this.current_block_id.toString()].type == 'Auto') {
          if (this.project.blocks[this.current_block_id.toString()].connectors.length > 0 && this.project.blocks[this.current_block_id.toString()].connectors[0].targets.length > 0) {
            this.current_block_id = this.project.blocks[this.current_block_id.toString()].connectors[0].targets[0];
            this.plan_message(socket_id, this.clients[socket_id].current_block_id);  
          }
        }
      }*/
  
      /*plan_message(block_id) {
        var self = this;

        setTimeout(function() {
          self.send_message(self.socket_id, self.project.blocks[block_id.toString()]);
        }, this.project.blocks[block_id.toString()].delay * 1000);
      }*/

      _send_current_message() {
        console.log('sending: ' + this.current_block_id);
        var self = this;
        var path = this.get_path();
        var block = this.project;
  
        if (path.length > 0) {
          block = this.project.blocks[path[0]];
  
          for (var i = 1; i < path.length; i++) {
            block = block.blocks[path[i]];
          }
        }       
        
        block = block.blocks[this.current_block_id.toString()];
        
  
        setTimeout(function() {
          self.send_message(block);
        }, block.delay * 1000);  
  
      }
      
      receive_message(str) {
        var path = this.get_path();
  
        var block = this.project.blocks[this.current_block_id.toString()];
  
        if (path.length > 0) {
          var block = this.project.blocks[path[0]];
  
          for (var i = 1; i < path.length; i++) {
            block = block.blocks[path[i]];
          }
  
          block = block.blocks[this.current_block_id.toString()];
        }
  
        // @TODO: improve processing of message
        if (block.type == 'MC') {
          for (var c in block.connectors) {
            if (block.connectors[c].label == str) {
              var new_id = block.connectors[c].targets[0];
              console.log(new_id);
              this.check_group_exit(new_id, c);
              //this._send_current_message();
            }
          }
        }
        else if (block.type == 'Text' || block.type == 'List') {
          for (var c in block.connectors) {
            if (block.connectors[c].label == str || block.connectors[c].label == '[else]') {
              var new_id = block.connectors[c].targets[0];
              this.check_group_exit(new_id, c);
              //this._send_current_message();
            }
          }
        }
      }      
  
      /*receive_message(str) {
        //this.clients[socket_id].messages.push(new Models.Message({message: str, source: 'user'}));
        //this.clients[socket_id].save();
        var block = this.project.blocks[this.clients[socket_id].current_block_id.toString()];
  
        // @TODO: improve processing of message
        if (block.type == 'MC') {
          for (var c in block.connectors) {
            if (block.connectors[c].label == str && block.connectors[c].targets.length > 0) {
              this.clients[socket_id].current_block_id = block.connectors[c].targets[0];
              this.plan_message(socket_id, this.clients[socket_id].current_block_id);
            }
          }
        }
        else if (block.type == 'Text' || block.type == 'List') {
          for (var c in block.connectors) {
            if ((block.connectors[c].label == str || block.connectors[c].label == '[else]') && block.connectors[c].targets.length > 0) {
              this.clients[socket_id].current_block_id = block.connectors[c].targets[0];
              this.plan_message(socket_id, this.clients[socket_id].current_block_id);
            }
          }
        }
      }*/
  
    }
  
  });
  