define("LocalProjectController", ["ProjectController"], function(ProjectController) {

  return class LocalProjectController extends ProjectController {

    constructor(json_str) {
      super();

      var self = this;

      $.when(this.load_project(json_str).then(function(project) {
        self.project = project;

        self.current_block_id = self.project.starting_block_id;

        self.send_message(self.project.blocks.get(self.project.starting_block_id.toString()));
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
      if (this.project.blocks.get(this.current_block_id.toString()).type == 'Auto') {
        this.current_block_id = this.project.blocks.get(this.current_block_id.toString()).connectors[0].targets[0];
        this._send_current_message();
      }
    }

    _send_current_message() {
      var self = this;

      setTimeout(function() {
        self.send_message(self.project.blocks.get(self.current_block_id.toString()));
      }, this.project.blocks.get(this.current_block_id.toString()).delay * 1000);
    }

    receive_message(str) {
      var block = this.project.blocks.get(this.current_block_id.toString());

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
