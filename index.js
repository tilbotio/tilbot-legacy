// Load required files
// @TODO: maybe put this in a separate file?
var requirejs = require('requirejs');
requirejs.config({
  nodeRequire: require,
  paths: {
    RemoteProjectServer: 'client/remote/projectserver',
    Models: 'client/remote/dbmodels',
    Project: 'shared/models/project',
    BasicBlock: 'shared/models/basicblock',
    AutoBlock: 'shared/models/blocks/autoblock',
    MCBlock: 'shared/models/blocks/mcblock',
    TextBlock: 'shared/models/blocks/textblock',
    ListBlock: 'shared/models/blocks/listblock',
    BasicConnector: 'shared/models/basicconnector',
    LabeledConnector: 'shared/models/connectors/labeledconnector',
    Observable: 'shared/controllers/observable',

    UserApiController: 'api/user',

    ProjectSchema: 'shared/models/db/project',
    UserSchema: 'shared/models/db/user'
  }
});

requirejs(['process', 'http', 'path', 'express', 'express-session', 'express-mongodb-session', 'body-parser', 'socket.io', 'mongoose', 'RemoteProjectServer', 'UserApiController', 'jquery-deferred'], function(process, http, path, express, session, mongodbsession, bodyparser, socket, mongoose, RemoteProjectServer, UserApiController, $) {
  /*
   * jquery-deferred is needed on the server-side because some shared modules
   * use it to dynamically require files. Can perhaps be cleaned up a bit in the future.
  */
  this.$ = $;

  // Create the server
  var app = express();

  // Needed for setting/maintaining sessions for the dashboard
  app.use(bodyparser.urlencoded({ extended: true }));

  // Set up the MongoDB connection
  var dbPath = 'mongodb://localhost/tilbot';
  
  if (process.env.MONGO_USERNAME != undefined) {
    dbPath = 'mongodb://' + process.env.MONGO_USERNAME + ':' + process.env.MONGO_PASSWORD + '@mongo:' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB;
  }

  console.log(dbPath);
  
  const options = {useNewUrlParser: true, useUnifiedTopology: true};
  const mongo = mongoose.connect(dbPath, options);

  // Make sure the express-mongodb-session can also use the existing connection
  const MongoDBStore = mongodbsession(session);

  // Main MongoDB connection
  mongo.then(() => {
    console.log('MongoDB connected');

    // Sessions
    const store = new MongoDBStore({
      // Because we are using mongoose rather than MongoDB, express-mongodb-session refuses to use the existing connection because it is not instanceof MongoDB.MongoClient
      //existingConnection: mongo.connection,
      //databaseName: process.env.MONGO_DB,
      uri: dbPath,
      collection: 'sessions'
    });

    // Catch errors
    store.on('error', function(error) {
      console.log(error);
    });

    app.use(session({
      secret: 'Super secretthings',
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
      },
      store: store,
      // Boilerplate options, see:
      // * https://www.npmjs.com/package/express-session#resave
      // * https://www.npmjs.com/package/express-session#saveuninitialized
      resave: true,
      saveUninitialized: true
    }));

    var port = 80;

    if (process.env.TILBOT_PORT != undefined) {
      console.log('yay');
      port = parseInt(process.env.TILBOT_PORT);
    }  

    app.set('port', port);

    // Main route -- load client (currently loads protocol.json)
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '/client/index.html'));
    });

    // Editor route
    app.get('/edit', (req, res) => {
      res.sendFile(path.join(__dirname, '/editor/index.html'));
    });

    // Logging in to dashboard
    app.get('/login', async (req, res) => {

      // Already logged in -- refer to dashboard page
      if (req.session.username !== undefined) {
        res.redirect('/dashboard');
        return;
      }

      /*
       * Check if the default 'admin' account exists.
       * If not, create one, and show instructions to the user.
      */
      var admin_account = await UserApiController.get_user('admin');

      if (admin_account === null) {
        UserApiController.create_account('admin', 'admin', 99).then(function(success) {
          if (success) {
            res.sendFile(path.join(__dirname, '/dashboard/first_use.html'));
          }
          else {
            // @TODO: error handling
            res.sendFile(path.join(__dirname, '/dashboard/first_use.html'));
          }
        });

      }

      // Admin account found, show the login page.
      else {
        res.sendFile(path.join(__dirname, '/dashboard/login.html'));
      }

    });

    // Logout from dashboard
    app.get('/logout', (req, res) => {
      req.session.destroy();
      res.redirect('/login');
    });

    // Dashboard page
    app.get('/dashboard', (req, res) => {
      // Only accessible if logged in
      if (req.session.username === undefined) {
        res.redirect('/login');
        return;
      }

      res.sendFile(path.join(__dirname, 'dashboard/dashboard.html'));
    });

    // API call: get dashboard contents
    // Admins get an overview of users, users get an overview of projects
    app.get('/api/get_dashboard', async (req, res) => {
      res.status(200);

      // Return error message if not logged in
      if (req.session.username === undefined) {
        res.send('NOT_LOGGED_IN');
      }

      else {
        UserApiController.get_user(req.session.username).then(function(user) {
          if (user !== null) {
            if (user.role == 99) { // admin, retrieve user accounts
              UserApiController.get_users().then(function(users) {
                var data = {'users': users};
                res.send(JSON.stringify(data));
              });
            }
            else { // regular user, retrieve projects

            }
          }
          // An invalid username is somehow in the session
          else {
            res.send('USER_NOT_FOUND');
          }
        });
      }
    });

    /**
     * API call: create a new user
     * Can only be used by users with the admin role (99)
     */
    app.post('/api/create_user', async (req, res) => {
      res.status(200);

      UserApiController.get_user(req.session.username).then(function(user) {
        if (user !== null) {
          if (user.role == 99) { // admin, retrieve user accounts
            UserApiController.create_account(req.body.username, req.body.password, 1).then(function(success) {
              if (success) {
                res.send('OK');
              }
              else {
                res.send('NOK');
              }
            });
          }
          else {
            res.send('USER_NOT_ADMIN');
          }
        }
        else {
          res.send('USER_NOT_FOUND');
        }
      });
    });

    /**
     * API call: log in and set the session to preserve this login
     */
    app.post('/api/login', async (req, res) => {
      res.status(200);

      UserApiController.login(req.body.username, req.body.password).then(function(success) {
        if(success) {
          req.session.username = req.body.username;
          req.session.save();
          res.send('OK');
        }

        else {
          res.send('NOK');
        }
      });
    });

    // Indicate directories for static linking of files (css, js, images)
    app.use(express.static('shared'));
    app.use(express.static('.'));

    var httpServer = http.createServer(app);

    // Temporary client socket code, replace with editor socket code later
    const io = socket(httpServer);
    var projectserver = new RemoteProjectServer(io, mongo);
    var clients = {};

    // Start express server
    httpServer.listen(app.get('port'), function() {
      console.log('Express server listening on port ' + app.get('port'));
    });

  }, error => {
    console.log(error, 'error');
  });

});
