define("BasicConnector", [], function() {
    return class BasicConnector {
      constructor(type, name) {
        this.type = 'Basic'; // No criteria, just forwards to next
        this.targets = [];
      }

      toJSON() {
        var output = {
          type: this.type,
          targets: this.targets
        };

        return output;
      }

      static fromJSON(json) {
        var connector = new this();
        connector.targets = json.targets;

        return connector;
      }
    }
});
