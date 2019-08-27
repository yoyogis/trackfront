'use strict';

module.exports = () => {
  let api = require('../../track/api');
  return async (ctx, next) => {
    let dataFromClient = ctx.packet[0];
    if(dataFromClient&&dataFromClient.type=='filter'){
      api.updateFilter(ctx.socket.id, dataFromClient.data)
    }
    await next();
    console.log('packet response!');
  };
};
