'use strict';

module.exports = app => {
  class User extends app.Service {
    async say() {
      return 'Hello Man123!';
    }
  }
  return User;
};
