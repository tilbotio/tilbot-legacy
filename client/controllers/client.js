define("ClientController", ["jquery", "handlebars", "TextClientController", "TextServerController", "TypingIndicatorController", "InputMCController", "InputListController", "InputACController", "LocalProjectController", "RemoteProjectController", "text!/client/views/client.html"],
function($, Handlebars, TextClientController, TextServerController, TypingIndicatorController, InputMCController, InputListController, InputACController, LocalProjectController, RemoteProjectController, view) {

  return class ClientController {

    constructor() {
      var self = this;
      this.dom = undefined;
      this.project = undefined;
      this.current_type = undefined;
      this.current_params = undefined;

      this.background_client = '#C42E51';

      require(['jqueryui'], function() {
          require(['jqueryuitouch'], function() {
            self.clientTemplate = Handlebars.compile(view);
            self.render();
            self.bindEvents();
            self.typingIndicator = new TypingIndicatorController();
            self.inputMC = new InputMCController();
            self.inputMC.subscribe(self);
            self.inputList = new InputListController();
            self.inputAC = new InputACController();

            if (document.referrer == '' || !document.referrer.includes('/edit/')) {
              var urlparts = document.URL.split('/');
              self.project_id = urlparts[urlparts.length-1];
        
              if (self.project_id.length != 32) {
                // @TODO: something
              }
  
              else {
                $.get('/api/get_socket', {
                  id: self.project_id
                }, function(socket) {
                  console.log(socket);
                  if (socket == '-1') {
                    // @TODO: something
                  }
                  else {
                    self.projectcontroller = new RemoteProjectController(socket);
                    self.projectcontroller.subscribe(self);                     
                  }
                });
              }                
            }

            // Temporary fix to check whether we are in an iFrame.
            // If not (stand-alone), use remote project manager
            /*if (window.self == window.top) {
              self.projectcontroller = new RemoteProjectController();
              self.projectcontroller.subscribe(self);
            }*/

          });
      });

    }

    bindEvents() {
      this.dom.on('keypress', { self: this }, this.key_pressed);

      $(window).on('message', { self: this }, this.message_received);

      $('#send_icon').on('click', { self: this}, this.post_message);

      /*$(document).keydown(function (e) {
          if(e.keyCode == 16) shiftDown = true;
      });

      $(document).keyup(function (e) {
          if(e.keyCode == 16) shiftDown = false;
      });*/
    }

    render() {
      this.dom = $(this.clientTemplate());
      $('#client_container').append(this.dom);
    }

    key_pressed(event) {
      console.log(event);
      if (!event.shiftKey && event.keyCode == 13) { // Enter -> submit!
        event.preventDefault(); // prevent another \n from being entered
        event.data.self.post_message(event);
      }
    }

    post_message(event) {
      var msg = '';
      if (event.data.self.current_type == 'MC') {
        msg = event.data.self.inputMC.selected;
      }
      else if (event.data.self.current_type == 'List') {
        if (event.data.self.current_params.number_input && $('#input_select_number').val() != '') {
          msg += $('#input_select_number').val() + ' ';
        }
        if (event.data.self.current_params.text_input && $('#input_select_text').text() != '') {
          msg += $('#input_select_text').text() + ' ';
        }
        msg += event.data.self.inputList.selected;
      }
      else if (event.data.self.current_type == 'AutoComplete') {
        msg = $('#ac_options').val();
      }
      else {
        var msg = $("#input_field").html().replace(/<div>/gi,'<br>').replace(/<\/div>/gi,'').replace('<br><br><br>', '<br><br>');
      }

      if (msg != '') {
        new TextClientController({ msg: msg, background_color: event.data.self.background_client});
        $("#input_field").empty();
        setTimeout(function() { $("body").scrollTop($("body")[0].scrollHeight); }, 10);
        event.data.self.projectcontroller.receive_message(msg);

        event.data.self.hide_all_inputs();
        $('#input_field').show();
        event.data.self.current_type = undefined;
        event.data.self.current_params = undefined;
      }

    }

    message_received(event) {
      let msg = event.originalEvent.data;

      // This could be a project to load, or a Qualtrics ID
      try {
        JSON.parse(msg);
        event.data.self.project_received(event);
      } 
      catch (e) {
        event.data.self.projectcontroller.send_qualtrics_id(msg);       
      }
    }

    project_received(event) {
      // Temp demo code
      $('#messages').empty();

      // Clear all ongoing timers (https://stackoverflow.com/questions/3847121/how-can-i-disable-all-settimeout-events)
      // Set a fake timeout to get the highest timeout id
      var highestTimeoutId = setTimeout(";");
      for (var i = 0 ; i < highestTimeoutId ; i++) {
          clearTimeout(i);
      }

      // Reset input to text
      event.data.self.hide_all_inputs();
      $('#input_field').show();


      event.data.self.projectcontroller = new LocalProjectController(event.originalEvent.data);
      event.data.self.projectcontroller.subscribe(event.data.self);
    }

    notify(src, message, params) {

      switch(message) {
        case 'chatbot_message': this.handle_message(params.type, params.content, params.params); break;
        case 'init': this.init(params); break;
        case 'option_selected': this.post_message({data: {self: this}}); break;
        case 'project_loaded': this.project_loaded({data: {self: this}});
        default: ;
      }

    }

    init(params) {
      $('#name').text(params.bot_name);
      $('#profile_img_src').attr('src', params.avatar_image);
      this.typingIndicator.set_avatar_image(params.avatar_image);
      this.avatar_image = params.avatar_image;
      this.bot_name = params.bot_name;
    }

    project_loaded(event) {
      $('#name').text(event.data.self.projectcontroller.project.bot_name);
      $('#profile_img_src').attr('src', event.data.self.projectcontroller.project.avatar_image);
      this.typingIndicator.set_avatar_image(event.data.self.projectcontroller.project.avatar_image);
      this.avatar_image = event.data.self.projectcontroller.project.avatar_image;
      this.bot_name = event.data.self.projectcontroller.project.bot_name;
    }

    hide_all_inputs() {
      $('#input_field').hide();
      this.inputMC.hide();
      this.inputList.hide();
      this.inputAC.hide();
    }

    handle_message(type, content, params) {
      var self = this;

      // Send the message
      this.typingIndicator.show();

      // @TODO: make typing indicator optional
      setTimeout(function() {
        self.typingIndicator.hide();
        self.send_message(type, content, params);
        self.projectcontroller.message_sent_event();
      }, 2000); // content.length / 15 * 1000);
    }

    send_message(type, content, params) {
      var self = this;
      this.current_type = type;
      this.current_params = params;

      new TextServerController({ msg: content, background_color: this.background_client, avatar_image: this.avatar_image});
      setTimeout(function() { $("body").scrollTop($("body")[0].scrollHeight); }, 10);


      this.hide_all_inputs();

      // Set the right input modality
      if (type == 'MC') {
        console.log(params.options);
        this.inputMC.redraw(params.options);
        this.inputMC.show();
      }
      else if (type == 'List') {
        console.log(params.options);
        this.inputList.redraw(params);
        this.inputList.show();
      }
      else if (type == 'AutoComplete') {
        console.log(params);
        this.inputAC.redraw(params.options);
        this.inputAC.show();
      }
      else {
        $('#input_field').show();
      }
    }

  }

});
