define(["jquery"], function($) {

  class LoginController {

    constructor() {
      this.bindEvents();
    }

    bindEvents() {
      $('#btn_login').on('click', { self: this }, this.login);
      $('input').on('keypress', { self: this }, this.keypress)
    }

    keypress(e) {
      if (e.which == 13) { // enter
        $('#btn_login').focus().click();
      }
    }

    login(e) {
      var username = $('#txt_username').val().trim();
      var password = $('#txt_pass').val().trim();

      if (username != '' && password != '') {
        $.post('/api/login',
          {
            username: username,
            password: password
          },
          function(res) {
            console.log(res);
            if (res == 'OK') {
              window.location.replace('/dashboard');
            }
          }
        );
      }

    }

  }

  new LoginController();

});
