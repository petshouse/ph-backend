import { errorCode } from '../lib/errorcode';
import { getConnection } from "typeorm";
import { User } from '../entity/User';
import { Media } from '../entity/Media';
import { Post } from '../entity/Post';
import send from 'koa-send';
import short from 'short-uuid';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { Token } from '../entity/Token';
import jwt from 'jsonwebtoken';
dotenv.config();

const translator = short(short.constants.flickrBase58, { consistentLength: false });

const transporter = nodemailer.createTransport({
	service: process.env.MAILSERVICE,
	port : 587,
	auth : {
		user : process.env.MAILID,
		pass : process.env.MAILPASSWORD
	}	
});

export const signUp = (async (ctx) => {
  const { email, nickName, password } = ctx.request.body;


  let body : object, status : number;
   const userEmail = await getConnection()
  .createQueryBuilder()
  .select("user")
  .from(User, "user")
  .where("user.email = :email", { email: email })
  .getOne();

 if (userEmail === undefined) {
    await getConnection()
    .createQueryBuilder()
    .insert()
    .into(User)
    .values({ email: email, nickName: nickName, password: password })
    .execute();

    status = 201;
    body = {};
  }else{
    status = 403;
    body = await errorCode(303);
  }

  ctx.status = status;
  ctx.body = body;
});

export const login = (async (ctx) => { 
  const { email, password } = ctx.request.body;
  let status : number, body : object;
  let accessToken, refreshToken;

  

  const user = await getConnection()
  .createQueryBuilder()
  .select(["isCheck"])
  .from(User, "user")
  .where("user.email = :email", { email : email })
  .andWhere("user.password = :password", {password : password})
  .getOne()

  if(user !== undefined){
    if(user[0] === false){

      accessToken = jwt.sign({ email },process.env.jwtkey,{expiresIn: '30m'});
      refreshToken = jwt.sign({ email },process.env.jwtkey,{expiresIn: '14d'});

      await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Token)
      .values({ 
        accessToken: accessToken,
        refreshToken: refreshToken,
        email: email
      })
      .execute();
      
      status = 200;
      body = {"accessToken" : accessToken, "refreshToken" : refreshToken};
    }else{
      status = 403;
      body = errorCode(107);
    }
  }else{
    status = 403
    body = errorCode(102)
  }

  ctx.status = status;
  ctx.body = body;
});

export const getToken = (async (ctx) => { 
  const refreshToken = ctx.header.refreshtoken;

  let status : number, body : object;

  const token = getConnection()
  .createQueryBuilder()
  .select(["accessToken"])
  .from(Token, "token")
  .where("token.refreshToken = :refreshToken", { refreshToken : refreshToken })
  .getOne()

  if(token !== undefined){
    status = 200;
    body = {"accessToken" : token[0]};
  }else{
    status = 403;
    body = errorCode(301);
  }
});

export const emailSend = (async (ctx) => {
  const email = ctx.header.email;

  let status : number, body : object;

  await transporter.sendMail({
    from: process.env.MAILID,
    to: `${email}`,
    subject: 'Your password',
    text: `${pass}`
  });
});

export const checkVerification = (async (ctx) => { 
});

export const uploadImage = (async (ctx) => { 
});

export const loadImage = (async (ctx) => { 
  // try { await send(ctx, path.path, { root: './files/' }); }
  // catch(err){
  //   ctx.status = 404;
  //   ctx.body = await errorCode(501);
  // }
});

export const loadPost = (async (ctx) => { 
});