define(["jquery", "jqueryui"], function($, ui) {

  class DashboardController {

    constructor() {
      this.get_data();
      this.bindEvents();
    }

    get_data() {
      var self = this;

      $('.user_row').remove();
      $('.project_row').remove();

      $.get('/api/get_dashboard', function(data) {
        try {
          var data_json = JSON.parse(data);

          $('#dashboard_header').text('Welcome, ' + data_json.username + '!');

          if (data_json.users !== undefined) {
            var total_active = 0;
            var total_projects = 0;
                  
            for (var u in data_json.users) {
              var line = `        <tr class="user_row">`;

              if (data_json.users[u].active) {
                total_active += 1;

                line += `              <td class="user_name">` + data_json.users[u].username + `</td>
                <td style="text-align: center">0</td>`;
              }
              else {
                line += `              <td class="user_name" style="text-decoration: line-through">` + data_json.users[u].username + `</td>
                <td style="text-decoration: line-through; text-align: center">0</td>`
              }
              
              line += `<td style="width: 99%; white-space: inherit">&nbsp;</td>`;

              if (data_json.users[u].active) {
                line += `              <td style="text-align: center"><i class="fa-solid fa-user-large-slash btn_user_inactive"></i></td>
                <td style="text-align: center">&nbsp;</td>`;
              }
              else {
                line += `              <td style="text-align: center">&nbsp;</td>
                <td style="text-align: center"><i class="fa-solid fa-user-plus btn_user_active"></i></td>`;
              }
              
              line += `        </tr>`;

              $(line).appendTo('#dashboard_users table tbody');
            }

            $(`        <tr class="user_row" style="border-top: 4px solid #000">
            <td>` + total_active + `</td>
            <td style="text-align: center">` + total_projects + `</td>
            <td style="width: 99%; white-space: inherit">&nbsp;</td>
            <td style="text-align: center">&nbsp;</td>
            <td style="text-align: center">&nbsp;</td>
          </tr>`).appendTo('#dashboard_users table tbody');

            $('#dashboard_header_users').show();
            $('.btn_user_inactive').on('click', { self: self, active: false }, self.set_user_active);
            $('.btn_user_active').on('click', { self: self, active: true }, self.set_user_active);
      
          }

          if (data_json.projects !== undefined) {
            var total_active = 0;

            if (data_json.projects.length == 0) {
              $('#no_projects').show();
              $('#dashboard_projects table').hide();
            }
            
            else {
              $('#no_projects').hide();
              $('#dashboard_projects table').show();

              for (var p in data_json.projects) {
                var line = `        <tr class="project_row" data-id="` + data_json.projects[p].id + `">
                <td>` + data_json.projects[p].name + `</td>`;

                if (data_json.projects[p].status == 1) {
                  total_active += 1;

                  line += `                  <td style="text-align: center">Running</td>
                  <td style="text-align: center"><i class="fa-solid fa-pause btn_pause"></i></td>
                  <td style="width: 99%; white-space: inherit">&nbsp;</td>
                  <td style="text-align: center"><i class="fa-solid fa-comment btn_view enabled"></i></td>`;
                }
                else {
                  line += `                  <td style="text-align: center">Paused</td>
                  <td style="text-align: center"><i class="fa-solid fa-play btn_start"></i></td>
                  <td style="width: 99%; white-space: inherit">&nbsp;</td>
                  <td style="text-align: center"><i class="fa-solid fa-comment btn_view"></i></td>`;
                }
                  
                line += `                  <td style="text-align: center; padding-right: 64px"><i class="fa-solid fa-pencil btn_edit"></i></td>
                <td style="text-align: center"><i class="fa-solid fa-trash btn_delete"></i></td>
                </tr>`;
                    
                $(line).appendTo('#dashboard_projects table tbody');
              }
  
              $(`        <tr class="project_row" style="border-top: 4px solid #000">
              <td>` + total_active + `</td>
              <td colspan="6">&nbsp;</td>
            </tr>`).appendTo('#dashboard_projects table tbody');
  
              $('.btn_edit').on('click', { self: self }, self.edit_project);
              $('.btn_start').on('click', { self: self, status: 1 }, self.toggle_status);
              $('.btn_pause').on('click', { self: self, status: 0 }, self.toggle_status);
              $('.btn_view.enabled').on('click', { self: self }, self.view_project);
              //$('.btn_user_active').on('click', { self: self, active: true }, self.set_user_active);              

            }

            if ($('#dashboard_header_projects').is(':hidden')) {
              $('#dashboard_header_projects').show();
              $('#dashboard_header_projects').click();  
            }
          
          }

        }
        catch(e) {
          console.log('error: ' + data);
        }

      });
    }

    bindEvents() {
      $('#btn_update_pass').on('click', { self: this }, this.update_pass);
      $('#btn_add_user').on('click', { self: this }, this.add_user);
      $('.dashboard_header').on('click', { self: this }, this.toggle_header);
      $('#new_user_button').on('click', { self: this }, this.popup_new_user);
      $('#overlay').on('click', { self: this }, this.close_overlay);
      $('#new_project_button').on('click', { self: this }, this.new_project);

      $('input').on('keypress', { self: this }, this.keypress);
    }
    
    popup_new_user(e) {
      $('#new_user_error').hide();      
      $('#txt_newuser_name').val('');
      $('#txt_newuser_pass').val('');
      $('#overlay').show();
      $('#new_user_popup').show( "scale", 250, function() {
        // Animation complete.
      });
    }

    close_overlay(e) {
      $('#overlay').hide();
      $('#new_user_popup').hide( "scale", 250, function() {
        // Animation complete.
      });
    }

    keypress(e) {
      if (e.which == 13) { // enter
        if ($(this).attr('id') == 'txt_old_pass' || $(this).attr('id') == 'txt_new_pass' || $(this).attr('id') == 'txt_new_pass2') {
          $('#btn_update_pass').focus().click();
        }

        else if ($(this).attr('id') == 'txt_newuser_name' || $(this).attr('id') == 'txt_newuser_pass') {
          $('#btn_add_user').focus().click();
        }
      }
    }    

    update_pass(e) {
      $('#pass_warning').hide();
      $('#pass_error').hide();

      var oldpass = $('#txt_old_pass').val().trim();
      var newpass1 = $('#txt_new_pass').val().trim();
      var newpass2 = $('#txt_new_pass2').val().trim();

      if (newpass1 != newpass2) {
        $('#pass_error .message_text').text('The two new passwords do not match.');
        $('#pass_error').show();
      }
      else {
        $.post('/api/change_pass',
        {
          oldpass: oldpass,
          newpass: newpass1
        },
        function(res) {
          if (res) {
            $('#pass_warning').show();            
          }
          else {
            $('#pass_error .message_text').text('Error changing password: did you enter the correct old password?');
            $('#pass_error').show();
          }
        });
      }
    }

    new_project(e) {
      $.post('/api/create_project', function(res) {
        if (res.id !== undefined) {
          window.location.href = '/edit/' + res.id;
        }
      });
    }

    edit_project(e) {
      window.location.href = '/edit/' + $(this).closest('tr').attr('data-id');
    }

    toggle_status(e) {
      $.post('/api/set_project_status', {
        projectid: $(this).closest('tr').attr('data-id'),
        status: e.data.status
      },
      function(res) {
        e.data.self.get_data();
      });
    } 
    
    view_project(e) {
      window.location.href = '/' + $(this).closest('tr').attr('data-id');
    }

    add_user(e) {
      $('#new_user_error').hide();

      var username = $('#txt_newuser_name').val().trim();
      var password = $('#txt_newuser_pass').val().trim();

      if (username != '' && password != '') {
        $.post('/api/create_user',
          {
            username: username,
            password: password
          },
          function(res) {
            console.log(res);
            if (res == 'OK') {
              e.data.self.close_overlay();
              e.data.self.get_data();
            }
            else if (res == 'USER_EXISTS') {
              $('#new_user_error .message_text').text('A user with this username already exists.');
              $('#new_user_error').show();
            }
            else {
              $('#new_user_error .message_text').text('An unknown error occurred.');
              $('#new_user_error').show();
            }
          }
        );
      }

      else {
        $('#new_user_error .message_text').text('Username or password cannot be empty.');
        $('#new_user_error').show();
      }

    }

    set_user_active(e) {

      $.post('/api/set_user_active',
        {
          active: e.data.active,
          username: $(this).closest('tr').find('.user_name').text()
        },
        function(res) {
          console.log(res);
          e.data.self.get_data();
        }
      );      
    }

    toggle_header(e) {
      var field = $(this).attr('id').replace('_header', '');
      $(this).find('.dashboard_header_caret_right').toggle();
      $(this).find('.dashboard_header_caret_down').toggle();

      if($('#' + field).is(':hidden')) {
        $('#' + field).slideDown();
      }
      else {
        $('#' + field).slideUp();
      }      
    }

  }

  new DashboardController();

});
