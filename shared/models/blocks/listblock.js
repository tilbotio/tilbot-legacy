define("ListBlock", ["BasicBlock", "LabeledConnector"], function(BasicBlock, LabeledConnector) {
    return class ListBlock extends BasicBlock {
      constructor() {
        super();
        this.type = 'List';
        this.connectors.push(new LabeledConnector('[else]'));
        this.text_input = false;
        this.number_input = false;
        this.items = [];

        /* Fixed visual properties not exported to JSON */
        this.icon = 'fa-square-caret-down';

        this.templates = ['text!/editor/views/basicblock_detail.html', 'text!/editor/views/blocks/listblock_detail.html'];
      }

      new_connector() {
        this.connectors.push(new LabeledConnector());
      }

      toJSON() {
        var output = super.toJSON();
        output.text_input = this.text_input;
        output.number_input = this.number_input;
        output.items = this.items;

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
        block.connectors = [];
        block.text_input = json.text_input;
        block.number_input = json.number_input;
        block.items = json.items;


        for (const [key, value] of Object.entries(json.connectors)) {
          require([value.type + 'Connector'], function(Connector) {
              block.connectors.push(Connector.fromJSON(value));

              if(Object.keys(block.connectors).length == Object.keys(json.connectors).length) {
                dfd.resolve(block);
              }

          });
        }

        return dfd.promise();
      }


    }
});
