'use strict';
const api = require('../../track/api');

module.exports = () => {
  return async (ctx, next) => {
    api.addConnection(ctx.socket.id, ctx.socket);
    const say = await ctx.service.user.say();
    ctx.socket.emit('track', 'auth!' + say);
    await next();
    console.log('disconnect!');
  };
};
