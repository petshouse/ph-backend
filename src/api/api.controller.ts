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
        status = 412;
        body = await errorCode(107);
      }
    }
  }else{
    status = 412;
    body = await errorCode(102);
  }

  ctx.status = status;
  ctx.body = body;
});

export const login = (async (ctx) => { 
  const { email, password } = ctx.request.body;
  let status : number, body : object;
  let accessToken, refreshToken;

 // const pass = crypto.createHmac('sha256', process.env.secret).update(`${password}`).digest('hex');
  

  const user = await getConnection()
  .createQueryBuilder()
  .select("user")
  .from(User, "user")
  .where("user.email = :email", { email : email })
  .andWhere("user.password = :password", {password : password})
  .getOne()

  if(user !== undefined){
    const emailcheck = await getConnection()
    .createQueryBuilder()
    .select("emailcheck")
    .from(EmailCheck,"emailcheck")
    .where("emailcheck.email = :email", {email : email})
    .getOne()

    if(emailcheck !== undefined){
      const accessToken = await jwtsign(user["num"]);
      const refreshToken = await jwtrefresh(user["num"]);

      const token = await getConnection()
      .createQueryBuilder()
      .select("token")
      .from(Token, "token")
      .where("token.email = :email", {email : email})
      .getOne()

      if(token === undefined){
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
      } else {
        await getConnection()
        .createQueryBuilder()
        .update(Token)
        .set({ 
          accessToken: accessToken,
          refreshToken: refreshToken
        })
        .where("email = :email", {email : email})
        .execute();
      }


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
  .execute()

  status = 200;
  body = {};


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
  const { accesstoken } = ctx.header.accesstoken;
  const fileName = ctx.request.file != undefined ? ctx.request.file.filename : undefined;
  let body : object, status : number; 

  const token = await getConnection()
  .createQueryBuilder()
  .select("token")
  .from(Token, "token")
  .where("accessToken = :accesstoken", {accesstoken : accesstoken})
  .getOne()
  if(fileName !== undefined) {
    if(token !== undefined) {
        await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Media)
        .values({
          mediaName: fileName
        })
        .execute();

        status = 201;
        body = {"filePath" : fileName};
    } else {
      status = 412;
      body = await errorCode(302);
    }
  }else {
    status = 403;
    body = await errorCode(401);
  }
});

export const loadImage = (async (ctx) => {
  const { media } = ctx.params;
  let body : object, status : number;
  
  const path = await getConnection()
  .createQueryBuilder()
  .select("media")
  .from(Media, "media")
  .where("media.uid = :uid", { uid: media })
  .orWhere("media.path = :path", { path: media })
  .getOne();

  try { await send(ctx, path.mediaName, { root: './files/' }); }
  catch(err){
    ctx.status = 404;
    ctx.body = await errorCode(501);
  }
});

export const loadPost = (async (ctx) => { 
  const authentication = await jwtverify(ctx.header.accesstoken);
  const uid = ctx.header.uid;

  let body : object, status : number, post : any;

  if (authentication != 'error') {
    const user = await getConnection()
    .createQueryBuilder()
    .select("user")
    .from(User, "user")
    .where("user.num = :uid", { uid: uid })
    .getOne();

    if (user !== undefined) {
      if (uid !== undefined) {
        post = await getConnection()
        .createQueryBuilder()
        .select(["post.num", "post.user", "post.title", "post.description", "post.mediaName", "post.date", "post.totalJoin", "post.area", "post.process"])
        .from(Post, "post")
        .where("post.user = :uid", { uid: uid })
        .getMany();
      }else{
        post = await getConnection()
        .createQueryBuilder()
        .select(["post.num", "post.user", "post.title", "post.description", "post.mediaName", "post.date", "post.totalJoin", "post.area", "post.process"])
        .from(Post, "post")
        .orderBy("RAND()")
        .getOne();
      }
      
      status = 200;
      body = post;
    }else{
      status = 403;
      body = await errorCode(303);
    }
  }else{
    status = 412;
    body = await errorCode(302);
  }

  ctx.status = status;
  ctx.body = body;
});

export const writePost = (async (ctx) => {
  const accesstoken = ctx.header.accesstoken;
  const { title, description, mediaId, area } = ctx.request.body;

  let status : number, body : object;
  const uid:any = await jwtverify(accesstoken);

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
      user: uid,
      title: title,
      description: description,
      mediaName: mediaId,
      area: area
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

export const idCheck = (async (ctx) => {
  const email = ctx.header.email;
  let status: number, body : object;
  let isDuplication: boolean;

  const user =  await getConnection()
  .createQueryBuilder()
  .select("user")
  .from(User, "user")
  .where("email = :email", {email : email})
  .getOne()

  if(user !== undefined){
    isDuplication = true;
  } else {
    isDuplication = false;
  }

  status = 200;
  body = {"isDuplication" : isDuplication};

  ctx.status = status;
  ctx.body = body;

});