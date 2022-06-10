define(["jquery"], function($) {

  class DashboardController {

    constructor() {
      this.get_data();
    }

    get_data() {
      var self = this;

      $.get('/api/get_dashboard', function(data) {
        try {
          var data_json = JSON.parse(data);
          console.log(data_json);

          if (data_json.users !== undefined) {
            // @TODO: add users to list so they can be managed
            for (var u in data_json.users) {
              $(`<div class="dashboard_user">
                    ` + data_json.users[u] + `
                 </div>`).appendTo('#dashboard_user_list');

            }

            $('#dashboard_users').show();
          }

          self.bindEvents();
        }
        catch(e) {
          console.log('error: ' + data);
        }

      });
    }

    bindEvents() {
      $('#btn_add_user').on('click', { self: this }, this.add_user);
      //$('input').on('keypress', { self: this }, this.keypress)
    }

    add_user(e) {
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
          }
        );
      }

    }

  }

  new DashboardController();

});
