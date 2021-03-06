const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const generateMessage = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
const publicPath = path.join(__dirname , './public');
const port = process.env.PORT || 3000; 


var app = express();
var server = http.createServer(app); 
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));

io.on('connection', (socket)=>{
    console.log('New user connected');

 socket.on('join', (param, callback) => {
    if(! isRealString(param.room) || !isRealString(param.name)){
       return callback('Name and Room name are required.');
    }
    socket.join(param.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, param.name, param.room);

    io.to(param.room).emit('updateUserList', users.getUserList(param.room));

    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
    socket.broadcast.to(param.room).emit('newMessage', generateMessage('Admin', `${param.name} has joined!`));
    callback();
 });

 socket.on('createMessage', (message, callback)=>{
    
    var user = users.getUser(socket.id);
    if(user && isRealString(message.text)){
        io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }
    
    callback();
 });

 socket.on('disconnect', () => {
       var user = users.removeUser(socket.id);
  
        if(user){
           io.to(user.room).emit('updateUserList', users.getUserList(user.room));
           io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
    }

 });
});
server.listen(port,()=>{

    console.log(`Server host on port ${port}`)
});