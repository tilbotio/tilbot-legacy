define(["handlebars", "EditorController"], function(Handlebars, EditorController) {
  'use strict';

  Handlebars.registerHelper('lower', function (aString) {
      return aString.toLowerCase()
  });

  Handlebars.registerHelper('nl2br', function (aString) {
      return aString.replace(/(?:\r\n|\r|\n)/g, '<br/>');
  });

  Handlebars.registerHelper('inc', function (value, options) {
      return parseInt(value) + 1;
  });

  Handlebars.registerHelper('semicolon', function (value, options) {
      return value.join(';');
  });

  Handlebars.registerHelper('checked', function (value, options) {
      if (value) {
        return 'checked';
      }
      else {
        return '';
      }
  });

  var App = {
    init: function() {
      this.editor = new EditorController();
    }
  };

  App.init();

});
