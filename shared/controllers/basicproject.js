define("BasicProjectController", ["Project", "Observable"],
function(Project, Observable) {

  return class BasicProjectController extends Observable {
    constructor() {
        super();
        
        this.project = new Project();
        this.selected_group_blocks = [];
    }

    get_path() {
      var path = [];

      console.log(this.selected_group_blocks);

      for (var b in this.selected_group_blocks) {
        path.push(this.selected_group_blocks[b].id);
      }

      console.log(path);

      return path;
    }

    get_current_block_id() {
      return this.project.current_block_id;
    }

    set_current_block_id(new_id) {
      this.project.current_block_id = new_id;
    }

    load_project(json_str) {
      var self = this;
      var dfd = $.Deferred();

      $.when(Project.fromJSON(/*JSON.parse(*/json_str/*)*/)).then(function(project) {
        self.project = project;
        dfd.resolve();
      });

      return dfd.promise();
    }

    move_to_group(params) {
      this.selected_group_blocks.push(params);      
    }

    move_level_up() {
      this.selected_group_blocks.pop();
    }

    move_to_root() {
      this.selected_group_blocks = [];
    }
  }
});
