'use strict';

module.exports = app => {
  class Controller extends app.Controller {
    async index() {
      const message = this.ctx.args[0];
      //console.log('chat :', message + ' : ' + this.ctx.session.sessionId);
     // const say = await this.ctx.service.user.say();
      //this.ctx.socket.emit('track', say);
    }
  }
  return Controller;
};
