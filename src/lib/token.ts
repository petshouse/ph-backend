import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

export const jwtsign = (async (id) => {
  const token : string = jwt.sign({ id: `${id}` },process.env.jwtkey,{expiresIn: '30m'});
  return token;
});

export const jwtrefresh = (async (email) => {
  const refreshToken = jwt.sign({email : `${email}`},process.env.jwtkey,{expiresIn: "14d"});
  return refreshToken;
});

export const jwtverify = (async (token) => {
  let over;
  await jwt.verify(token, process.env.jwtkey, (error, decoded) => {
    if(error){ over = 'error'; }
    else{ over = decoded['id']; }
  });
  return over;
});