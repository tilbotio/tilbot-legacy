define("BasicBlock", ["Observable", "BasicConnector"], function(Observable, BasicConnector) {
    return class BasicBlock extends Observable {
      constructor(type, name) {
        super();

        this.type = 'Basic'; // Should never be used
        this.name = '';
        this.content = '';
        this.delay = 0;
        this.x = 0;
        this.y = 0;
        this.connectors = [];

        /* Fixed visual properties not exported to JSON */
        this.icon = '';
        this.background_color = '';
        this.connector_color = '';

        /* Used for editing this model, also not exported to JSON */
        /* Note: not sure if this should be here since it is editor-specific
           and now in the shared folder */
        this.templates = ['text!/editor/views/basicblock_detail.html'];

        this.contentEmpty = function() { // Needed for Handlebars filtering
          return this.content == '';
        }
      }

      setName(name) {
        this.name = name;
        this.notifyAll('model_updated');
      }

      setContent(content) {
        this.content = content;
      }

      setLocation(x, y) {
        this.x = x;
        this.y = y;
      }

      new_connector() {
        this.connectors.push(new BasicConnector());
      }

      _getObject() {
        var obj = {
          type: this.type,
          name: this.name,
          content: this.content,
          delay: this.delay,
          x: this.x,
          y: this.y,
          connectors: []
        };

        for(var i = 0; i < this.connectors.length; i++) {
          obj.connectors.push(this.connectors[i].toJSON());
        }

        return obj;
      }

      toJSON() {
        var output = this._getObject();

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

        if (json.connectors.length == 0) {
          dfd.resolve(block);
        }
        else {
          for (const [key, value] of Object.entries(json.connectors)) {
            require([value.type + 'Connector'], function(Connector) {
                block.connectors.push(Connector.fromJSON(value));
  
                if(Object.keys(block.connectors).length == Object.keys(json.connectors).length) {
                  dfd.resolve(block);
                }
  
            });
          }  
        }

        return dfd.promise();
      }
    }
});
