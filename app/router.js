'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const cors = require('@koa/cors');
  var parser = require('ua-parser-js');
  app.use(async (ctx, next) =>{
    var ua = parser(ctx.request.headers['user-agent']);
    if(!ctx.session.sessionId){
      if(ua.browser.name=="Safari"){
        ctx.session.sessionId="Safari-169362017";
      }else{
        ctx.session.sessionId=ua.browser.name+"-" + Math.floor(Math.random()*1000000000);
      }
      
    }
    
    await next();
  })
  
  app.use(cors());
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.post('/track', controller.home.trackPost);

  //dashboard
  router.get('/track/metadata', controller.home.metadataGet);
  router.get('/track/tracks', controller.home.trackGet);
  router.get('/track/sessions', controller.home.sessionsGet);
};
