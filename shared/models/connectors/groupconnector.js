define("GroupConnector", ["BasicConnector"], function(BasicConnector) {
    return class GroupConnector extends BasicConnector {
      constructor(label = '') {
        super();
        this.type = 'Group';
        this.label = label;
        this.from_id = -1;
        this.from_connector = -1;
      }

      toJSON() {
        var output = super.toJSON();
        output.label = this.label;

        return output;
      }

      static fromJSON(json) {
        var connector = new this();
        connector.targets = json.targets;
        connector.label = json.label;

        return connector;
      }
    }
});
