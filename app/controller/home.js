'use strict';

const Controller = require('egg').Controller;
const api = require('../track/api');

class HomeController extends Controller {
  async index() {
    this.ctx.body = 'hi, egg';
  }

  async metadataGet(){
    this.ctx.body = api.getMetadata();
  }

  async trackGet() {
    let sessionId = this.ctx.request.query.sessionId;
    this.ctx.body = api.getTracks(sessionId);
  }

  async trackPost() {
    try {
      let sessionId = this.ctx.session.sessionId;
      let data = this.ctx.request.body;
      data.sessionId = sessionId;
      data.trackTimestamp = Date.now();
      api.addData(data)
      this.ctx.body = {success:true};
    } catch (error) {
      console.error(error);
      this.ctx.body = {success:false};
    }
  }

  async sessionsGet(){
    let full = this.ctx.request.query.full;
    this.ctx.body = api.getSessions(full!='full');
  }
}

module.exports = HomeController;
