define("GroupBlockController", ["BlockController"],
function(BlockController) {

  return class GroupBlockController extends BlockController {
    constructor(id, model) {
        super(id, model);
    }

    render() {
        super.render();
        this.dom.find('.block_content').hide();
    }

    select_or_edit_block(event) {
        if (event.data.self.selected) {
            if (!event.data.self.dragging) {
                alert('go into group!');
                event.data.self.notifyAll('move_to_group', {model: event.data.self.model, id: event.data.self.id});
            }
        }
        else {
            event.data.self.select_block(event);
        }
    }  
  }
});
