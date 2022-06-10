define("UserApiController", ["UserSchema"], function(UserSchema) {

  return class UserApiController {

    /**
     * Managing users stored in the database.
     * @constructor
     */
    constructor() {

    }

    /**
     * Retrieve active user by username
     *
     * @param {string} username - The username to search for.
     * @return {UserSchema} The user object from database if found, otherwise null.
     */
    static get_user(username) {
      return new Promise(resolve => {
        UserSchema.findOne({ username: username, active: true }).then(function(user) {
          resolve(user);
        });
      });
    }

    /**
     * Retrieve all active users from database (role 1, not admin).
     *
     * @return {string[]} Array of usernames present in database.
     */
    static get_users() {
      return new Promise(resolve => {
        UserSchema.find({ role: 1, active: true }).then(function(users) {
          var users_return = [];

          for (var u in users) {
            users_return.push(users[u].username);
          }
          resolve(users_return);
        });
      });
    }

    /**
     * Try to log in to the dashboard.
     *
     * @param {string} user - Username
     * @param {string} pass - Password
     * @return {boolean} true if logged in correctly, false if not.
     */
    static login(user, pass) {
      return new Promise(resolve => {
        UserSchema.findOne({ username: user, active: true }).then(function(schema) {
          if (schema != null) {

            schema.verifyPassword(pass)
            .then(function(valid) {
              resolve(valid);
            })
            .catch(function(err) {
              console.log(err);
              resolve(false);
            });

          }
          else {
            resolve(false);
          }
        });

      });

    }

    /**
     * Create a new account and store it in the database.
     *
     * @param {string} user - Username
     * @param {string} pass - Password
     * @param {number} role - User role: 99 = admin; 1 = user
     * @return {boolean} true if logged in correctly, false if not.
     */
    static create_account(user, pass, role) {
      return new Promise(resolve => {
        var schema = new UserSchema();
        schema.username = user;
        schema.password = pass;
        schema.role = role;
        schema.save().then(function() {
          resolve('OK')
        }).catch(function(error) {
          resolve(error);
        });
      });
    }
  }

});
