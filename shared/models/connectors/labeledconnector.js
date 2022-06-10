define("LabeledConnector", ["BasicConnector"], function(BasicConnector) {
    return class LabeledConnector extends BasicConnector {
      constructor(label = '') {
        super();
        this.type = 'Labeled';
        this.label = label;
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
