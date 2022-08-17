define("GroupBlock", ["BasicBlock", "BasicConnector"], function(BasicBlock, BasicConnector) {
    return class GroupBlock extends BasicBlock {
      constructor() {
        super();
        this.type = 'Group';

        /* Fixed visual properties not exported to JSON */
        this.icon = 'fa-layer-group';
        this.background_color = '#D77F44';
        this.connector_color = '#AF5625';

        this.blocks = {};
        this.starting_block_id = -1;
        this.canvas_width = 0;
        this.canvas_height = 0;
      }

      toJSON() {
        var output = super.toJSON();
        output.blocks = {};
        output.starting_block_id = this.starting_block_id;
        output.canvas_width = this.canvas_width;
        output.canvas_height = this.canvas_height;

        for (const [key, value] of Object.entries(this.blocks)) {
            output.blocks[key] = value.toJSON();
        }

        return output;
      }

      static fromJSON(json) {
        var dfd = $.Deferred();

        var block = new this();
        block.name = json.name;
        block.content = json.content;
        block.delay = json.delay;
        block.x = json.x;
        block.y = json.y;
        block.starting_block_id = json.starting_block_id;
        block.canvas_width = json.canvas_width;
        block.canvas_height = json.canvas_height;

        block.blocks = {};

        if (json.blocks !== undefined) {
            for (const [key, value] of Object.entries(json.blocks)) {
                require([value.type + 'Block'], function(Block) {
                    $.when(Block.fromJSON(value)).then(function(b) {
                        block.blocks[key] = b;      
                    });
      
                });
              }      
        }
        
        block.connectors = [];

        if (json.connectors.length == 0) {
            dfd.resolve(block);
        }
        else { 

            for (const [key, value] of Object.entries(json.connectors)) {
            require([value.type + 'Connector'], function(Connector) {
                block.connectors.push(Connector.fromJSON(value));

                if(Object.keys(block.connectors).length == Object.keys(json.connectors).length) {
                    dfd.resolve(block);
                }

            });
            }
        }
        
        return dfd.promise();
      }

    }
});