define("GroupBlock", ["BasicBlock", "BasicConnector"], function(BasicBlock, BasicConnector) {
    return class GroupBlock extends BasicBlock {
      constructor() {
        super();
        this.type = 'Group';

        /* Fixed visual properties not exported to JSON */
        this.icon = 'fa-layer-group';
        this.background_color = '#F8F8F8';
        this.connector_color = '#E8E8E8';
      }
    }
});