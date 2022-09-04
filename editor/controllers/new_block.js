define("NewBlockController", ["jquery", "handlebars", "Observable", "text!/editor/views/new_block.html"],
function($, Handlebars, Observable, view) {

  return class NewBlockController extends Observable {
    constructor() {
      super();

        // @TODO: move to blocks and dynamically load?
        this.options = [
          {
            name: 'Automatically proceed',
            description: 'Does not wait for input from the user. Automatically proceeds to next message (you can add a delay to the next message).',
            icon: 'fa-clock',
            type: 'AutoBlock'
          },
          {
            name: 'Group (experimental)',
            description: 'Group several other blocks into one.',
            icon: 'fa-layer-group',
            type: 'GroupBlock'
          },
          {
            name: 'List selection',
            description: 'The user can choose one out of multiple options. Works well with larger number of options than multiple choice, and can be combined with text/number input.',
            icon: 'fa-square-caret-down',
            type: 'ListBlock'
          },
          {
            name: 'Multiple choice',
            description: 'The user can choose one out of multiple options.',
            icon: 'fa-list-ol',
            type: 'MCBlock'
          },
          {
            name: 'Text',
            description: 'Detect specific (or any) input text',
            icon: 'fa-font',
            type: 'TextBlock'
          }
        ];

        this.selected_new_block = undefined;

        this.newblockTemplate = Handlebars.compile(view);

        this.render();
        this.bindEvents();
    }

    bindEvents() {
      $('.new_block_popup_line').on('click', {self: this}, this.popup_line_select);
      $('#btn_new_block_confirm').on('click', {self: this}, this.create_new_block);
    }

    render() {
      $('#editor_container').append(this.newblockTemplate(this.options));
    }

    show() {
      $('#new_block_popup').show( "scale", 250, function() {
        // Animation complete.
      });
    }

    hide() {
      $('#new_block_popup').hide( "scale", 250, function() {
        // Animation complete.
      });

      this.selected_new_block = undefined;
      $('.new_block_popup_line').removeClass('new_block_popup_line_selected');
      $('#btn_new_block_confirm').addClass('button_disabled');
    }

    popup_line_select(event) {
      $('.new_block_popup_line').removeClass('new_block_popup_line_selected');
      $('#btn_new_block_confirm').removeClass('button_disabled');

      if (event.target.classList.contains('new_block_popup_line')) {
        var target = $(event.target);
      }
      else {
        var target = $($(event.target).parents('.new_block_popup_line')[0]);
      }

      target.addClass('new_block_popup_line_selected');
      event.data.self.selected_new_block = target.attr('data-block-type');
    }

    create_new_block(event) {
      if ($(event.target).hasClass('button_disabled')) {
        return;
      }
      else {
        require.onError = function(err) {
          console.log(err);
        }

        console.log(event.data.self.selected_new_block);

        require([event.data.self.selected_new_block], function(Block) {
          console.log(Block);
          event.data.self.notifyAll('new_block_added', {block: new Block()});
        });

      }
    }
  }

});
