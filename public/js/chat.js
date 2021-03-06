var socket = io();

 function scrollToBottom(){

     var messages = jQuery('#messages');
     var newMessage = messages.children('li:last-child');

     var scrollHeight = messages.prop('scrollHeight');
     var scrollTop = messages.prop('scrollTop');
     var clientHeight = messages.prop('clientHeight');
     var newMessageHeight = newMessage.innerHeight();
     var lastMessageHeight = newMessage.prev().innerHeight(); 
     if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight){
         messages.scrollTop(scrollHeight);
     }
 }
socket.on('connect', function(){
    
    var params = jQuery.deparam(window.location.search);

    socket.emit('join', params , function(err){
        if(err){
            alert(err);
            window.location.href="/";
        }else{
            console.log('No Error');
        }
    });

});

socket.on('disconnect', function(){
    console.log('Disconnected from server');
});

socket.on('updateUserList', function(users){
    console.log('Users list', users);
     var ol = jQuery('<ol></ol>');

     users.forEach(function(user){
         ol.append(jQuery('<li></li>').text(user));
     });
     jQuery('#users').html(ol);
});

socket.on('newMessage', function(message){
    
    var formattedTime = moment(message.createdAt).format('hh:mm a');
    var template = jQuery('#message-template').html();
    
    var html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    });
     jQuery('#messages').append(html);
      scrollToBottom();
});

socket.on('newLocationMessage', function(message){

    var formattedTime = moment(message.createdAt).format('hh:mm a');
    var template = jQuery('#location-message-template').html();

    var html = Mustache.render(template, {
        from: message.from,
        createdAt: formattedTime,
        url: message.url
    });

    jQuery('#messages').append(html);
     scrollToBottom();

});

jQuery('#message-form').on('submit', function(e){
      e.preventDefault();

      var messageTextBox = jQuery('[name = message]');
      socket.emit('createMessage', {
          from: 'User',
          text: messageTextBox.val()
      }, function(){
        messageTextBox.val('');
      });
});
