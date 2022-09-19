define("LocalProjectController", ["BasicProjectController"], function(BasicProjectController) {

  return class LocalProjectController extends BasicProjectController {

    constructor(json_str) {
      super();

      var self = this;

      $.when(this.load_project(JSON.parse(json_str)).then(function() {

        self.current_block_id = self.project.starting_block_id;

        self.send_message(self.project.blocks[self.project.starting_block_id.toString()]);
      }));
    }

    send_message(block) {
      var params = {};

      if (block.type == 'MC') {
        params.options = [];
        for (var c in block.connectors) {
          params.options.push(block.connectors[c].label);
        }

        this.notifyAll('chatbot_message', {type: block.type, content: block.content, params: params});
      }
      else if (block.type == 'List') {
        params.options = block.items;
        params.text_input = block.text_input;
        params.number_input = block.number_input;

        this.notifyAll('chatbot_message', {type: block.type, content: block.content, params: params});
      }
      else if (block.type == 'Group') {
        this.move_to_group({id: this.current_block_id, model: block});
        this.current_block_id = block.starting_block_id;
        this.send_message(block.blocks[block.starting_block_id]);
      }
      else {
        this.notifyAll('chatbot_message', {type: block.type, content: block.content, params: params});
      }
    }

    check_group_exit(id) {
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
          if (block.blocks[group_block_id.toString()].connectors[i].from_id == this.current_block_id) {
            var new_id = block.blocks[group_block_id.toString()].connectors[i].targets[0];
            this.current_block_id = group_block_id;
            this.check_group_exit(new_id);
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
          this.check_group_exit(new_id);
        }                  
      }      
    }

    _send_current_message() {
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
      var block = this.project.blocks[this.current_block_id.toString()];

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
