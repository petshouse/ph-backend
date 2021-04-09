import Router from '@koa/router';
import multer from '@koa/multer';

const api = new Router();
const storage = multer.diskStorage({
  destination: async (req, file, cb) => { cb(null, './files') },
  filename: async (req, file, cb) => { cb(null,`${Date.now()}-${file.originalname}`) }
});

const fileFilter = async (req, file, cb) => {
  let typeArray = file.mimetype.split('/');
  let fileType = typeArray[1];
  if (fileType == 'jpg' || fileType == 'png' || fileType == 'jpeg' || fileType == 'gif') {
    cb(null, true);
  }else{
    cb(null, false)
  }
}

const upload = multer({ storage: storage, fileFilter: fileFilter });

import { signUp, login, getToken, checkVerification, emailSend, uploadImage,loadImage, loadPost } from './api.controller';

api.post('/v1/signUp', signUp);
api.post('/v1/login', login);
api.get('/v1/getToken', getToken);
api.post('/v1/verification/:code/:email', checkVerification);
api.get('/v1/verification', emailSend);
api.post('/v1/media', upload.single('media'), uploadImage);
api.get('/v1/media/:media', loadImage);
api.get('/v1/post', loadPost);

export default api