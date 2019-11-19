module.exports = {
  jwtSecret: process.env.TOKEN_KEY || 'shin',
  jwtSession: {
    session: false
  }
};
