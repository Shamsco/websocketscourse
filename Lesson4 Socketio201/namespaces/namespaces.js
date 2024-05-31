const express = require('express');
const app = express();

// require('socket.io') = Server in the docs (THE CLASS)
const socketio = require('socket.io')

app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(8001);

// io = the server object in the docs
const io = socketio(expressServer);
io.of('/').on('connection', (socket) =>{
    socket.join('chat');
    io.of('/').to('chat').emit('welcomeToChatRoom', {});
    // io.of('/').to('chat').to('chat2').to('adminChat').emit('welcomeToChatRoom', {});
    io.of('/admin').emit('userJoinedMainNS', '')
//io.on('connection', (socket) =>{
    console.log(socket.id, ' has connected');
    //in ws we use "send" method, and in socket.io we use the "emit" method 
    //socket.emit('messageFromServer', {data: "Welcome to the socket server!!!"});
    socket.on('newMessageToServer', (dataFromClient) => {
        console.log(dataFromClient)
        io.of('/').emit('newMessageToClients', {text: dataFromClient.text})
        // io.emit('newMessageToClients', {text: dataFromClient.text})

    })
})

io.of('/admin').on('connection', (socket) =>{ 
    console.log(socket.id, 'has joined /admin')
    // socket.join('chat');
    // io.of('/admin').emit('messageToClientsFromAdmin', {});
    io.of('/admin').to('chat').emit('welcomeToChatRoom', {});
})