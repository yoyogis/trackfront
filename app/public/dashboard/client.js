'use strict';

window.socketClient = (function(){
  // or http://127.0.0.1:7001/chat
  const socket = io('http://127.0.0.1:7001');

  socket.on('connect', () => {
    console.log('connect!');
    filter({sessionId:2});
  });

  socket.on('track', msg => {
    console.log('track from server: ', msg);
  });

  function filter(filterObject){
    socket.emit({type:'filter', data:filterObject});
  }

  function onTrack(callback){
    socket.on('track', callback);
  }

  return {
    filter:filter,
    onTrack:onTrack
  }
})();
