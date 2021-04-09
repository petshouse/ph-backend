import { errorCode } from '../lib/errorcode';
// import { jwtverify, jwtrefresh, jwtsign } from '../lib/token';
import { getConnection } from "typeorm";
import { User } from '../entity/User';
import { Media } from '../entity/Media';
import { Post } from '../entity/Post';
// import send from 'koa-send';
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
   const user = await getConnection()
  .createQueryBuilder()
  .select("user")
  .from(User, "user")
  .where("user.email = :email", { email: email })
  .getOne();

 if (user === undefined) {
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

// 트랜젝션 줄이기!!!
export const login = (async (ctx) => { 
  const { id, password } = ctx.request.body;

  let user = await getConnection()
  .createQueryBuilder()
  .select(["email"])
  .from(User, 'user')

  // await getConnection()
  //   .createQueryBuilder()
  //   .insert()
  //   .into(Token)
  //   .values({ 
  //     accessToken: jwt.sign({ email },process.env.jwtkey,{expiresIn: '30m'}),
  //     refreshToken: jwt.sign({ email },process.env.jwtkey,{expiresIn: '14d'}),
  //     email: email 
  //   })
  //   .execute();

});

export const getToken = (async (ctx) => { 
});

export const checkVerification = (async (ctx) => { 
});

export const emailSend = (async (ctx) => { 
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