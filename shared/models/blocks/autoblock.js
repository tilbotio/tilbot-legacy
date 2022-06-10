define("AutoBlock", ["BasicBlock", "BasicConnector"], function(BasicBlock, BasicConnector) {
    return class AutoBlock extends BasicBlock {
      constructor() {
        super();
        this.type = 'Auto';

        this.connectors.push(new BasicConnector());

        /* Fixed visual properties not exported to JSON */
        this.icon = 'fa-clock';
      }
    }
});
