import { errorCode } from '../lib/errorcode';
import { getConnection } from "typeorm";
import { User } from '../entity/User';
import { Media } from '../entity/Media';
import { Post } from '../entity/Post';
import { EmailCheck } from '../entity/EmailCheck'
import send from 'koa-send';
import short from 'short-uuid';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { Token } from '../entity/Token';
import { jwtsign, jwtrefresh, jwtverify } from '../lib/token';
import crypto from 'crypto';
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
  const { email, nickname, password } = ctx.request.body;

  let body : object, status : number;
   const user = await getConnection()
  .createQueryBuilder()
  .select("user")
  .from(User, "user")
  .where("user.email = :email", { email: email })
  .getOne();

  if (user === undefined) {
    const check = await getConnection()
    .createQueryBuilder()
    .select("emailcheck")
    .from(EmailCheck, "emailcheck")
    .where("emailcheck.email = :email", { email: email })
    .getOne();

    if(check  === undefined) {
      status = 403;
      body = await errorCode(107);
    }else{
      if(check["isCheck"] === false){
        const pass: string = crypto.createHmac('sha256', process.env.secret).update(password).digest('base64');

        await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({ email: email, nickName: nickname, password: pass })
        .execute();

        status = 201;
        body = {};
      }else{
        status = 403;
        body = await errorCode(107);
      }
    }
  }else{
    status = 403;
    body = await errorCode(102);
  }

  ctx.status = status;
  ctx.body = body;
});

export const login = (async (ctx) => { 
  const { email, password } = ctx.request.body;
  let status : number, body : object;
  let accessToken, refreshToken;

  const pass = crypto.createHmac('sha256', process.env.secret).update(`${password}`).digest('hex');
  

  const user = await getConnection()
  .createQueryBuilder()
  .select("user")
  .from(User, "user")
  .where("user.email = :email", { email : email })
  .andWhere("user.password = :password", {password : pass})
  .getOne()

  if(user !== undefined){
    const emailcheck = await getConnection()
    .createQueryBuilder()
    .select("emailcheck")
    .from(EmailCheck,"emailcheck")
    .where("emailcheck.email = :email", {email : email})
    .getOne()

    if(emailcheck["isCheck"] === true && emailcheck !== undefined){
      accessToken = jwtsign(email);
      refreshToken = jwtrefresh(email);

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
      status = 412;
      body = errorCode(107);
    }
  }else{
    status = 412
    body = errorCode(102)
  }

  ctx.status = status;
  ctx.body = body;
});

export const getToken = (async (ctx) => { 
  const refreshToken = ctx.header.refreshtoken;

  let status : number, body : object;

  const token = await getConnection()
  .createQueryBuilder()
  .select("token")
  .from(Token, "token")
  .where("token.refreshToken = :refreshToken", { refreshToken : refreshToken })
  .getOne()

  if(token !== undefined){
    status = 200;
    body = {"accessToken" : token["accessToken"]};
  }else{
    status = 403;
    body = errorCode(301);
  }


  ctx.status = status;
  ctx.body = body;
});

export const emailSend = (async (ctx) => {
  const { email } = ctx.request.body;

  let status : number, body : object;

  let code : number = Math.floor(Math.random() * 1000000)+100000;
	if(code>1000000){
   	code = code - 100000;
	}

  const user = await getConnection()
  .createQueryBuilder()
  .select("user")
  .from(User, "user")
  .where("user.email = :email", { email : email })
  .getOne()

  if(user !== undefined){
    await transporter.sendMail({
      from: process.env.MAILID,
      to: `${email}`,
      subject: 'Your Email Verification Code',
      text: `${code}`
    });

    await getConnection()
    .createQueryBuilder()
    .insert()
    .into(EmailCheck)
    .values({
      email : email,
      code : code
    })

    status = 200;
    body = {}
  } else {
    status = 412;
    body = errorCode(108);
  }


  ctx.status = status;
  ctx.body = body;
  
});

export const checkVerification = (async (ctx) => { 
  const { email, code } = ctx.request.body;

  let status : number, body : object;

  const verification = await getConnection()
  .createQueryBuilder()
  .select("email")
  .from(EmailCheck, "email")
  .where("email.email = :email", { email : email})
  .andWhere("email.code = :code", { code : code })
  .getOne()

  if(verification !== undefined){
    await getConnection()
    .createQueryBuilder()
    .update(EmailCheck)
    .set({isCheck: true})
    .where("email.email = :email", { email : email})
    .execute()

    status = 200;
    body = {};
  } else {
    status = 412;
    body = errorCode(108);
  }

  ctx.status = status;
  ctx.body = body;
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

export const writePost = (async (ctx) => {
  const accesstoken = ctx.header.accesstoken;
  const { title, description, mediaId } = ctx.request.body;

  let status : number, body : object;

  const token = await getConnection()
  .createQueryBuilder()
  .select("token")
  .from(Token, "token")
  .where("accessToken = :accesstoken", {accesstoken : accesstoken})
  .getOne()

  if(token !== undefined){
    await getConnection()
    .createQueryBuilder()
    .insert()
    .into(Post)
    .values({
      title: title,
      description: description,
      mediaName: mediaId
    })
    .execute()

    status = 201;
    body = {};
  } else {
    status = 412;
    body = errorCode(302);
  }

  ctx.status = status;
  ctx.body = body;
});