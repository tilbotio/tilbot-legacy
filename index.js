// Load required files
// @TODO: maybe put this in a separate file?
var requirejs = require('requirejs');
requirejs.config({
  nodeRequire: require,
  paths: {
    Models: 'client/remote/dbmodels',
    Project: 'shared/models/project',
    BasicBlock: 'shared/models/basicblock',
    /*AutoBlock: 'shared/models/blocks/autoblock',
    MCBlock: 'shared/models/blocks/mcblock',
    TextBlock: 'shared/models/blocks/textblock',
    ListBlock: 'shared/models/blocks/listblock',*/
    BasicConnector: 'shared/models/basicconnector',
    LabeledConnector: 'shared/models/connectors/labeledconnector',
    Observable: 'shared/controllers/observable',

    UserApiController: 'api/user',
    ProjectApiController: 'api/project',

    BasicProjectController: 'shared/controllers/basicproject',
    ServerProjectController: 'editorsocket/controllers/serverproject',

    ProjectSchema: 'shared/models/db/project',
    UserSchema: 'shared/models/db/user'
  }
});

requirejs(['process', 'fs', 'net', 'http', 'https', 'path', 'child_process', 'express', 'express-session', 'express-mongodb-session', 'body-parser', 'socket.io', 'mongoose', 'UserApiController', 'ProjectApiController', 'ServerProjectController', 'jquery-deferred'], function(process, fs, net, http, https, path, child_process, express, session, mongodbsession, bodyparser, socket, mongoose, UserApiController, ProjectApiController, ServerProjectController, $) {
  var use_https = false;

  if (process.env.USE_HTTPS != undefined) {
    use_https = (process.env.USE_HTTPS == '1');
  }

  /*
   * jquery-deferred is needed on the server-side because some shared modules
   * use it to dynamically require files. Can perhaps be cleaned up a bit in the future.
  */
  this.$ = $;

  // 'Dynamically' include the different block types that are available, and also apply this to the client-side
  var tmppaths = {};

  const dir = fs.opendirSync('shared/models/blocks')
  let dirent
  while ((dirent = dir.readSync()) !== null) {
    const contents = fs.readFileSync('shared/models/blocks/' + dirent.name, 'utf-8');
    var blockname = contents.substring(contents.indexOf('define("')+8, contents.indexOf('"', contents.indexOf('define("')+8));

    tmppaths[blockname] = 'shared/models/blocks/' + dirent.name;



    //var blockname = dirent.name.charAt(0).toUpperCase() + dirent.name.slice(1);
    //blockname.replace('block.json', 'Block');
    console.log(blockname)
  }
  dir.closeSync()

  
  // Add it to the list of paths on the server-side
  requirejs.config({
    paths: tmppaths
  });

  // Update the client-side list of paths
  //fs.copyFile('/editor/app.jstemplate', '/editor/app.js');
  var blockstr = '';

  for (const [key, value] of Object.entries(tmppaths)) {
    blockstr += "\t\t" + key + ': ' + '"' + value.slice(0,-3) + '"' + ",\r\n";
  }

  fs.readFile('editor/app.jstemplate', 'utf-8', function (err, contents) {
    if (err) {
      console.log(err);
    }
    console.log(blockstr);

    const replaced = contents.replace('[BLOCKS]', blockstr);
  
    fs.writeFile('editor/app.js', replaced, 'utf-8', function (err) {
      console.log(err);
    });
  });

  //console.log(requirejs.s.contexts._.config);

  // Keep track of running external processes for bots.
  this.running_bots = {};

  // Create the server
  var app = express();

  // Needed for setting/maintaining sessions for the dashboard
  app.use(bodyparser.urlencoded({ extended: true }));

  // Set up the MongoDB connection
  var dbPath = 'mongodb://localhost/tilbot';
  
  if (process.env.MONGO_USERNAME != undefined) {
    dbPath = 'mongodb://' + process.env.MONGO_USERNAME + ':' + process.env.MONGO_PASSWORD + '@mongo:' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB;
  }
  
  const options = {useNewUrlParser: true, useUnifiedTopology: true};
  const mongo = mongoose.connect(dbPath, options);

  // Make sure the express-mongodb-session can also use the existing connection
  const MongoDBStore = mongodbsession(session);

  // Main MongoDB connection
  mongo.then(() => {
    console.log('MongoDB connected');

    // If we are running in Docker, start the connection to the container that can fire up the bots in their own containers.
    if (process.env.TILBOT_PORT != undefined) {
      this.botlauncher = new net.Socket();
      this.botlauncher.connect(1337, '10.0.0.2', function() {
        console.log('Connected to bot launcher');
        //client.write('het is jan');
        //client.write('nog al eens');
      });
    }

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

    // Launch all running bots
    ProjectApiController.get_running_projects().then(function(projects) {
      for (var p in projects) {
        this.start_bot(projects[p].id);
      }
    });
    
    // Editor route
    app.get('/edit/*', (req, res) => {
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
        var data = {'username': req.session.username};

        UserApiController.get_user(req.session.username).then(function(user) {
          if (user !== null) {
            if (user.role == 99) { // admin, retrieve user accounts
              UserApiController.get_users().then(async function(users) {

                var promises = [];
                for (var u in users) {
                  var projects = await ProjectApiController.get_running_projects_user(users[u].username);
                  users[u].running_projects = projects.length;
                }

                data.users = users;
                res.send(JSON.stringify(data));
              });
            }
            else { // regular user, retrieve projects
              ProjectApiController.get_projects(req.session.username).then(function(projects) {
                data.projects = projects;
                res.send(JSON.stringify(data));
              });
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
            UserApiController.create_account(req.body.username, req.body.password, 1).then(function(response) {
              if (response.code === undefined) {
                res.send('OK');
              }
              else if (response.code == 11000) {
                res.send('USER_EXISTS');
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

    /**
     * API call: change a user's password
     */
    app.post('/api/change_pass', async (req, res) => {
      res.status(200);

      UserApiController.update_password(req.session.username, req.body.oldpass, req.body.newpass).then(function(success) {
        res.send(success);
      })
    });

    /**
     * API call: change a user's status (active/inactive)
     */
     app.post('/api/set_user_active', async (req, res) => {
      res.status(200);

      UserApiController.get_user(req.session.username).then(function(user) {
        if (user !== null) {
          if (user.role == 99) { // admin, retrieve user accounts
            UserApiController.set_user_active(req.body.username, req.body.active).then(async function(response) {
              // If a user was set to inactive, stop all of their running projects.
              if (req.body.active == 'false') {
                var projects = await ProjectApiController.get_running_projects_user(req.body.username);

                for (var p in projects) {
                  ProjectApiController.set_project_status(projects[p].id, 0).then(function(response) {
                    this.stop_bot(projects[p].id);
                  });
                }
              }

              res.send('OK');
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
     * API call: create a new project
     * Can only be used by users with the regular role (1)
     */
     app.post('/api/create_project', async (req, res) => {
      res.status(200);

      UserApiController.get_user(req.session.username).then(function(user) {
        if (user !== null) {
          if (user.role == 1) {
            ProjectApiController.create_project(req.session.username).then(function(response) {
              if (response.code === undefined) {
                res.send(response);
              }
              else if (response.code == 11000) {
                res.send('PROJECT_EXISTS');
              }
              else {
                res.send('NOK');
              }
            });
          }
          else {
            res.send('USER_INCORRECT_ROLE');
          }
        }
        else {
          res.send('USER_NOT_FOUND');
        }
      });
    });    

    // API call: get a single project
    app.get('/api/get_project', async (req, res) => {
      res.status(200);

      UserApiController.get_user(req.session.username).then(function(user) {
        if (user !== null) {
          if (user.role == 1) {
            ProjectApiController.get_project(req.query.id, req.session.username).then(function(response) {
              console.log(response);
              if (response == null) {
                res.send('NOK')
              }
              else {
                res.send(response);
              }
            });
          }
          else {
            res.send('NOK');
          }
        }
        else {
          res.send('NOK');
        }
      });

    });

    // API call: import a project, replacing the original
    app.post('/api/import_project', async (req, res) => {
      res.status(200);
      
      UserApiController.get_user(req.session.username).then(function(user) {
        if (user !== null) {
          if (user.role == 1) {
            ProjectApiController.import_project(req.body.project, req.body.project_id, req.session.username).then(function(response) {
              res.send(response);
            });
          }
          else {
            res.send('NOK');
          }
        }
        else {
          res.send('NOK');
        }
      });

    });    

    // API call: retrieve a project's socket if active -- anyone can do this, no need to be logged in.
    app.get('/api/get_socket', async (req, res) => {
      res.status(200);

      ProjectApiController.get_socket(req.query.id).then(function(response) {
        res.send(response);
      });
    });

    // API call: change the status of a project (0 = paused, 1 = running)
    app.post('/api/set_project_status', async (req, res) => {
      res.status(200);

      UserApiController.get_user(req.session.username).then(function(user) {
        if (user !== null) {
          if (user.role == 1) {
            ProjectApiController.get_project(req.body.projectid, req.session.username).then(function(response) {
              if (response != null) {
                ProjectApiController.set_project_status(req.body.projectid, req.body.status).then(function(response) {
                  if (response) {
                    console.log(req.body.status);
                    if (req.body.status == 1) {
                      this.start_bot(req.body.projectid);
                    }
                    else {                      
                      this.stop_bot(req.body.projectid);
                    }          
                    res.send('OK');
                  }
                });
              }
              else {
                res.send('NOK');
              }
            });
          }
          else {
            res.send('NOK');
          }
        }
      });
    });

    /**
     * API call: change a project's status (active/inactive)
     */
     app.post('/api/set_project_active', async (req, res) => {
      res.status(200);

      UserApiController.get_user(req.session.username).then(function(user) {
        if (user !== null) {
          if (user.role == 1) {
            ProjectApiController.get_project(req.body.projectid, req.session.username).then(function(response) {
              if (response != null) {
                if (response.status == 1) {
                  // Stop project from running first.
                  ProjectApiController.set_project_status(req.body.projectid, 0).then(function(response) {
                    this.stop_bot(req.body.projectid);
                  });
                }

                // Make the project inactive
                ProjectApiController.set_project_active(req.body.projectid, req.body.active).then(function(response) {
                  res.send('OK');
                });
              }
              else {
                res.send('NOK');
              }
            });
          }
          else {
            res.send('NOK');
          }
        }
        else {
          res.send('USER_NOT_FOUND');
        }
      });
    });


    this.start_bot = function(projectid) {
      console.log('starting ' + projectid);
      // Check whether we are running in Docker or not
      if (process.env.TILBOT_PORT != undefined) {
        this.botlauncher.write('start ' + projectid);
      }
      else {
        // Stop the bot if it is currently already running (Docker does this too further down the line)
        if (this.running_bots[projectid] !== undefined) {
          this.stop_bot(projectid);
        }

        this.running_bots[projectid] = child_process.fork('./clientsocket/index.js', [projectid], {
          silent: true
        });

        this.running_bots[projectid].stdout.on('data', (data) => {
          console.log(data.toString());
        });
      }
    }

    this.stop_bot = function(projectid) {
      console.log('stopping ' + projectid);
      // Check whether we are running in Docker or not
      if (process.env.TILBOT_PORT != undefined) {
        this.botlauncher.write('stop ' + projectid);
      }
      else {
        if (this.running_bots[projectid] !== undefined) {
          this.running_bots[projectid].send('exit');
        }
      }
    }

    // Indicate directories for static linking of files (css, js, images)
    app.use(express.static('shared'));
    app.use(express.static('.'));

    // Main route -- load client (currently loads protocol.json)
    app.get('/*', (req, res) => {
      res.sendFile(path.join(__dirname, '/client/index.html'));
    });

    var io;

    if (use_https && fs.existsSync(__dirname + '/certs/privkey.pem') && fs.existsSync(__dirname + '/certs/fullchain.pem')) {
      var port = 443;

      if (process.env.TILBOT_PORT != undefined) {
        port = parseInt(process.env.TILBOT_PORT);
      }
    
      app.set('port', port);  

      const key = fs.readFileSync(__dirname + '/certs/privkey.pem');
      const cert = fs.readFileSync(__dirname + '/certs/fullchain.pem');
      var ssloptions = {
        key: key,
        cert: cert
      };   
      
      var httpsServer = https.createServer(ssloptions, app);

      // Start express server
      httpsServer.listen(app.get('port'), function() {
        console.log('Express server listening on port ' + app.get('port'));

      });      

      // Start a socket for the editor to update the project files on the fly
      io = socket(httpsServer);
    }

    else {
      var port = 80;
  
      if (process.env.TILBOT_PORT != undefined) {
        port = parseInt(process.env.TILBOT_PORT);
      }
    
      app.set('port', port);  
      
      var httpServer = http.createServer(app);

      // Start express server
      httpServer.listen(app.get('port'), function() {
        console.log('Express server listening on port ' + app.get('port'));
      });      

      // Start a socket for the editor to update the project files on the fly
      io = socket(httpServer);

    }

    //var projectserver = new RemoteProjectServer(io, mongo);
    
    var editorclients = {};

    io.on('connection', (socket) => {
      console.log('a user connected');
      editorclients[socket.id] = new ServerProjectController(socket, mongoose);

      socket.on('disconnect', () => {
        editorclients[socket.id].destroy();
        if (editorclients[socket.id].ever_modified && editorclients[socket.id].project.status == 1) {
          // Restart the bot if it was running
          console.log('restarting bot because it was changed');
          var project_id = editorclients[socket.id].project.id;
          this.start_bot(project_id);
        }
        delete editorclients[socket.id];
        console.log('disconnected');
      });

    });




  }, error => {
    console.log(error, 'error');
  });

});
