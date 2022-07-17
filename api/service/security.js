const { verify, sign } = require("jsonwebtoken");
const { readFileSync } = require("fs");

const privateKey = readFileSync("./keys/secret.key");

const extractTokenFromHeader = (req) => {
  const jwtToken = req.headers["authorization"];
  if (!jwtToken) {
    return undefined;
  }
  try {
    const res = verify(jwtToken, privateKey);
    if (res.sub) {
      return res.sub;
    }
  } catch(e) {
    console.log("Invalid JWT Token: ", e);
  }

  return undefined;
};

const generateJwt = (token) => {
  console.log(token)
  return sign({sub: token}, privateKey, {expiresIn: 2592000000 });
};

module.exports = {
  extractTokenFromHeader,
  generateJwt,
};
