define("RemoteProjectServer", ["SocketProjectController"], function(SocketProjectController) {

    return class RemoteProjectServer {
  
      constructor(io, mongoose, project) {
        this.io = io;
        this.project = project;
        this.clients = {};
        var self = this;
  
        try {
          //const data = fs.readFileSync('protocol.json', 'utf8');
  
          //$.when(Project.fromJSON(JSON.parse(data))).then(function(project) {
          //  self.project = project;
  
            io.on('connection', (socket) => {
              console.log('a user connected');
              self.clients[socket.id] = new SocketProjectController(self.io, self.project, socket.id);
  
              socket.on('message sent', () => {
                self.clients[socket.id].message_sent_event();
              });
  
              socket.on('user_message', (str) => {
                self.clients[socket.id].receive_message(str);
              });

              socket.on('qualtrics id', (str) => {
                self.clients[socket.id].store_qualtrics_id(str);
              })
  
              socket.on('disconnect', () => {
                //self.clients[socket.id].session_closed = new Date();
                //self.clients[socket.id].save();
                delete self.clients[socket.id];
  
                console.log('disconnected');
              });
            });
  
          //});
  
        } catch (err) {
          console.error(err)
        }
      }
  
    }
  
  });
  