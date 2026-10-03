'use strict';

module.exports = {
  port:          process.env.PORT        || 3000,
  nodeEnv:       process.env.NODE_ENV    || 'development',
  apiVersion:    process.env.API_VERSION || 'v1',
  allowedOrigin: process.env.ALLOWED_ORIGIN || '*',
};
