define("GroupConnector", ["BasicConnector"], function(BasicConnector) {
    return class GroupConnector extends BasicConnector {
      constructor(from_id, from_connector, label = '') {
        super();
        this.type = 'Group';
        this.label = label;
        this.from_id = from_id;
        this.from_connector = from_connector;
      }

      toJSON() {
        var output = super.toJSON();
        output.label = this.label;
        output.from_id = this.from_id;
        output.from_connector = this.from_connector;

        return output;
      }

      static fromJSON(json) {
        var connector = new this();
        connector.targets = json.targets;
        connector.label = json.label;
        connector.from_id = json.from_id;
        connector.from_connector = json.from_connector;

        return connector;
      }
    }
});
