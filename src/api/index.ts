import Router from '@koa/router';
import multer from 'multer';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';
aws.config.loadFromPath(__dirname + '/../../s3.json');

const s3 = new aws.S3();
const api = new Router();

// const storage = multer.diskStorage({
//   destination: async (req, file, cb) => { cb(null, './files') },
//   filename: async (req, file, cb) => { cb(null,`${Date.now()}-${file.originalname}`) }
// });

const fileFilter = async (req, file, cb) => {
  let typeArray = file.mimetype.split('/');
  let fileType = typeArray[1];
  if (fileType == 'jpg' || fileType == 'png' || fileType == 'jpeg' || fileType == 'gif') {
    cb(null, true);
  }else{  
    cb(null, false)
  }
}

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'petshouse',
    acl: 'public-read',
    destination: async (req, file, cb) => { cb(null, './file') },
    key: async (req, file, cb) => { cb(null,`${Date.now()}-${file.originalname}`) }
  }),
  fileFilter: fileFilter
}, 'NONE');

// const upload = multer({ storage: storage, fileFilter: fileFilter });

import { signUp, login, getToken, checkVerification, emailSend, uploadImage,loadImage, loadPost, writePost, idCheck } from './api.controller';

api.post('/v1/auth', signUp);
api.post('/v1/login', login);
api.get('/v1/auth', getToken);
api.post('/v1/verification', checkVerification);
api.post('/v1/emailsend', emailSend);
api.post('/v1/media', upload.array('media', 2), uploadImage);
api.get('/v1/media/:media', loadImage);
api.get('/v1/post', loadPost);
api.post('/v1/post', writePost);
api.get('/v1/id', idCheck);
export default api