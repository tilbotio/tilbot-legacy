define(["handlebars", "ClientController"], function(Handlebars, ClientController) {
  'use strict';

  var App = {
    init: function() {
      this.client = new ClientController();
    }
  };

  App.init();

});
