define("RemoteProjectController", ["BasicProjectController"], function(BasicProjectController) {

  return class RemoteProjectController extends BasicProjectController {

    constructor(port) {
      super();

      var self = this;

      // Some ugly URL rewriting here, not sure if it can be improved.
      require([document.URL.substring(0, document.URL.length-33) + ':' + port + '/socket.io/socket.io.js'], function(io) {
        self.socket = io(document.URL.substring(0, document.URL.length-33) + ':' + port);

        self.socket.on('bot message', self.message_received.bind(self));  
      });
    }

    message_received(params) {
      this.notifyAll('chatbot_message', params);
    }

    send_message(block) {
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

      this.notifyAll('chatbot_message', {type: block.type, content: block.content, params: params});
    }

    message_sent_event() {
      this.socket.emit('message sent');
    }

    _send_current_message() {
      var self = this;

      setTimeout(function() {
        self.send_message(self.project.blocks[self.current_block_id]);
      }, this.project.blocks[this.current_block_id].delay * 1000);
    }

    receive_message(str) {
      this.socket.emit('user_message', str);
    }

  }

});
