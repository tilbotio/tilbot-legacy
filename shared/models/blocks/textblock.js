define("TextBlock", ["BasicBlock", "LabeledConnector"], function(BasicBlock, LabeledConnector) {
    return class TextBlock extends BasicBlock {
      constructor() {
        super();
        this.type = 'Text';
        this.connectors.push(new LabeledConnector('[else]'));

        /* Fixed visual properties not exported to JSON */
        this.icon = 'fa-font';
        this.background_color = '#FC1F8C';
        this.connector_color = '#CF0267';

        this.templates = ['text!/editor/views/basicblock_detail.html', 'text!/editor/views/blocks/textblock_detail.html'];
      }

      new_connector() {
        this.connectors.push(new LabeledConnector());
      }

    }
});
