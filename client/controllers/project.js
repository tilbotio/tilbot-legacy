define("ProjectController", ["Observable", "Project"], function(Observable, Project) {

  return class ProjectController extends Observable {

    constructor() {
      super();
    }

    load_project(json_str) {
      var self = this;
      var dfd = $.Deferred();

      $.when(Project.fromJSON(JSON.parse(json_str))).then(function(project) {
        dfd.resolve(project);
      });

      return dfd.promise();
    }
  }

});
