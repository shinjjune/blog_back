module.exports = {
  jwtSecret: process.env.TOKEN_KEY || "mesut",
  jwtSession: {
    session: false
  }
};
