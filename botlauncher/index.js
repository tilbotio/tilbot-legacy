var net = require('net');
const { exec } = require('child_process');

var server = net.createServer(function(socket) {
    socket.on('data', function(data) {
        console.log(data.toString());
        var parts = data.toString().split(' ');
        console.log(parts[0]);

        if (parts[0] == 'start') {
            // Find open port
            var port = -1;
            var tmpsocket = net.createServer(function(socket) {

            });

            tmpsocket.listen(0, function() {
                port = tmpsocket.address().port;
                tmpsocket.close();
                exec("chroot /host docker run --rm --env-file /node/app/.env --network tilbot_tilbot-network --name " + parts[1] + " -p " + port + ":" + port + " tilbot_node node clientsocket/index.js " + parts[1] + " " + port);
            });

        }

        else if (parts[0] == 'stop') {
            exec("chroot /host docker stop " + parts[1]);
            console.log("chroot /host docker stop " + parts[1]);
        }
    })
});

server.listen(1337, '10.0.0.2');