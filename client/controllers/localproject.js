define("LocalProjectController", ["ProjectController"], function(ProjectController) {

  return class LocalProjectController extends ProjectController {

    constructor(json_str) {
      super();

      var self = this;

      $.when(this.load_project(json_str).then(function(project) {
        self.project = project;

        self.current_block_id = self.project.starting_block_id;

        self.send_message(self.project.blocks[self.project.starting_block_id]);
      }));
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
      if (this.project.blocks[this.current_block_id].type == 'Auto') {
        this.current_block_id = this.project.blocks[this.current_block_id].connectors[0].targets[0];
        this._send_current_message();
      }
    }

    _send_current_message() {
      var self = this;

      setTimeout(function() {
        self.send_message(self.project.blocks[self.current_block_id]);
      }, this.project.blocks[this.current_block_id].delay * 1000);
    }

    receive_message(str) {
      var block = this.project.blocks[this.current_block_id];

      // @TODO: improve processing of message
      if (block.type == 'MC') {
        for (var c in block.connectors) {
          if (block.connectors[c].label == str) {
            this.current_block_id = block.connectors[c].targets[0];
            this._send_current_message();
          }
        }
      }
      else if (block.type == 'Text' || block.type == 'List') {
        for (var c in block.connectors) {
          if (block.connectors[c].label == str || block.connectors[c].label == '[else]') {
            this.current_block_id = block.connectors[c].targets[0];
            this._send_current_message();
          }
        }
      }
    }

  }

});
