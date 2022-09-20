define("RemoteProjectServer", ["LogSchema"], function(LogSchema) {

    return class RemoteProjectServer {
  
      constructor(io, mongoose, project) {
        this.io = io;
        this.project = project;
        this.clients = {};
        var self = this;
  
        try {
          //const data = fs.readFileSync('protocol.json', 'utf8');
  
          //$.when(Project.fromJSON(JSON.parse(data))).then(function(project) {
          //  self.project = project;
  
            io.on('connection', (socket) => {
              console.log('a user connected');
              self.clients[socket.id] = new LogSchema();
              self.clients[socket.id].current_block_id = self.project.starting_block_id;
              //self.clients[socket.id].save();
  
              self.plan_message(socket.id, self.clients[socket.id].current_block_id);
  
              socket.on('message sent', () => {
                self.message_sent_event(socket.id);
              });
  
              socket.on('user_message', (str) => {
                self.receive_message(socket.id, str);
              });
  
              socket.on('disconnect', () => {
                self.clients[socket.id].session_closed = new Date();
                self.clients[socket.id].save();
                delete self.clients[socket.id];
  
                console.log('disconnected');
              });
            });
  
          //});
  
        } catch (err) {
          console.error(err)
        }
      }
  
      send_message(socket_id, block) {
        var params = {};
  
        if (block.type == 'MC') {
          params.options = [];
          for (var c in block.connectors) {
            params.options.push(block.connectors[c].label);
          }
        }
        else if (block.type == 'List') {
          params.options = block.items;
          params.text_input = block.text_input;
          params.number_input = block.number_input;
        }
  
        this.io.to(socket_id).emit('bot message', {type: block.type, content: block.content, params: params});
      }
  
      message_sent_event(socket_id) {
        // Log
        //this.clients[socket_id].messages.push(new Models.Message({message: this.project.blocks[this.clients[socket_id].current_block_id].content, source: 'bot'}));
        //this.clients[socket_id].save();
  
        if (this.project.blocks[this.clients[socket_id].current_block_id.toString()].type == 'Auto') {
          if (this.project.blocks[this.clients[socket_id].current_block_id.toString()].connectors.length > 0 && this.project.blocks[this.clients[socket_id].current_block_id.toString()].connectors[0].targets.length > 0) {
            this.clients[socket_id].current_block_id = this.project.blocks[this.clients[socket_id].current_block_id.toString()].connectors[0].targets[0];
            this.plan_message(socket_id, this.clients[socket_id].current_block_id);  
          }
        }
      }
  
      plan_message(socket_id, block_id) {
        var self = this;

        setTimeout(function() {
          self.send_message(socket_id, self.project.blocks[block_id.toString()]);
        }, this.project.blocks[block_id.toString()].delay * 1000);
      }
  
      receive_message(socket_id, str) {
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
      }
  
    }
  
  });
  