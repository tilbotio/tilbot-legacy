define("MCBlock", ["BasicBlock", "LabeledConnector"], function(BasicBlock, LabeledConnector) {
    return class MCBlock extends BasicBlock {
      constructor() {
        super();
        this.type = 'MC';

        /* Fixed visual properties not exported to JSON */
        this.icon = 'fa-list-ol';

        this.templates = ['text!/editor/views/basicblock_detail.html', 'text!/editor/views/blocks/mcblock_detail.html'];
      }

      new_connector() {
        this.connectors.push(new LabeledConnector());
      }

    }
});
