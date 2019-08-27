'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1539822232134_5134';

  // add your config here
  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: true
    },
    domainWhiteList: ['*']
  };
  
  config.cors = {
    origin:'*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    credentials: true
  };

  exports.io = {
    namespace: {
      '/': {
        connectionMiddleware: [ 'auth' ],
        packetMiddleware: [ 'filter' ],
      },
      '/filter': {
        connectionMiddleware: [ 'auth' ],
        packetMiddleware: [],
      },
    },
  };
  
  config.middleware = [];

  

  return config;
};

