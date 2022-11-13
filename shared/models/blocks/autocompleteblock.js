define("AutoCompleteBlock", ["BasicBlock", "LabeledConnector"], function(BasicBlock, LabeledConnector) {
    return class AutoCompleteBlock extends BasicBlock {
      constructor() {
        super();
        this.type = 'AutoComplete';
        this.connectors.push(new LabeledConnector('[any]'));
        this.options = [];

        /* Fixed visual properties not exported to JSON */
        this.icon = 'fa-table-list';
        this.background_color = '#A2D744';
        this.connector_color = '#66A025';

        this.templates = ['text!/editor/views/basicblock_detail.html', 'text!/editor/views/blocks/acblock_detail.html'];
      }

      new_connector() {
        this.connectors.push(new LabeledConnector());
      }

      toJSON() {
        var output = super.toJSON();
        output.options = this.options;

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
        block.options = json.options;

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
