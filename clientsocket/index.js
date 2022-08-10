// Load required files
// @TODO: maybe put this in a separate file?
var requirejs = require('requirejs');
requirejs.config({
  nodeRequire: require,
  paths: {
    RemoteProjectServer: 'controllers/projectserver',
    /*Models: 'client/remote/dbmodels',
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
    ProjectApiController: 'api/project',*/

    ProjectSchema: '../shared/models/db/project',
    LogSchema: '../shared/models/db/log'
    //UserSchema: 'shared/models/db/user'
  }
});

requirejs(['process', 'fs', 'http', 'https', 'path', 'socket.io', 'mongoose', 'ProjectSchema', 'RemoteProjectServer', 'jquery-deferred'], function(process, fs, http, https, path, socket, mongoose, ProjectSchema, RemoteProjectServer, $) {
  /*
   * jquery-deferred is needed on the server-side because some shared modules
   * use it to dynamically require files. Can perhaps be cleaned up a bit in the future.
  */
  this.$ = $;

  var use_https = false;

  if (process.env.USE_HTTPS != undefined) {
    use_https = (process.env.USE_HTTPS == '1');
  }

  // Allow parent process to terminate this one
  process.on('message', function(message) {
    if (message == 'exit') {
      process.exit();
    }
  });  

  // Set up the MongoDB connection
  var dbPath = 'mongodb://localhost/tilbot';
  
  if (process.env.MONGO_USERNAME != undefined) {
    dbPath = 'mongodb://' + process.env.MONGO_USERNAME + ':' + process.env.MONGO_PASSWORD + '@mongo:' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB;
  }
  
  const options = {useNewUrlParser: true, useUnifiedTopology: true};
  const mongo = mongoose.connect(dbPath, options);

  // Main MongoDB connection
  mongo.then(() => {
    console.log('MongoDB connected');
    
    // First try to retrieve project -- if it doesn't exist, stop creating socket.
    ProjectSchema.findOne({'id': process.argv[2]}).then(function(project) {
        if (project === null) {
            console.log('Project not found -- exiting');
            process.exit();
        }

        else {
            var port = 0;

            if (process.argv[3] !== undefined) {
              port = process.argv[3];
            }

            function app(req, res) {
        
            };
        
            var io = null;
        
            if (use_https && fs.existsSync(__dirname + '/../certs/privkey.pem') && fs.existsSync(__dirname + '/../certs/fullchain.pem')) {
              const key = fs.readFileSync(__dirname + '/../certs/privkey.pem');
              const cert = fs.readFileSync(__dirname + '/../certs/fullchain.pem');
              var ssloptions = {
                key: key,
                cert: cert
              };   
              
              var httpsServer = https.createServer(ssloptions, app);
        
              // Start express server
              httpsServer.listen(port, function() {
                console.log('Socket server listening on port ' + httpsServer.address().port + ' (https)');
                project.socket = httpsServer.address().port;
                project.save();
              });      
        
              io = socket(httpsServer, {
                cors: {
                    origin: '*'
                }
              });
            }
        
            else {
              var httpServer = http.createServer(app);
        
              // Start express server
              httpServer.listen(port, function() {
                console.log('Socket server listening on port ' + httpServer.address().port + ' (http)');
                project.socket = httpServer.address().port;
                project.save();
              });      
        
              io = socket(httpServer, {
                cors: {
                    origin: '*'
                }
              });
            }
        
            // Temporary client socket code, replace with editor socket code later
            //const io = socket(httpServer);
            var projectserver = new RemoteProjectServer(io, mongo, project);
            //var clients = {};
        }
    });
  }, error => {
    console.log(error, 'error');
  });

});
