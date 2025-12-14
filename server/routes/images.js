import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import AWS from 'aws-sdk';

const router = express.Router();

let storage;

if (process.env.LOCAL === "TRUE") {
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
} else {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
  });

  storage = multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET,
    acl: 'public-read',
    key: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
}

const upload = multer({ storage });

router.post('/upload', upload.single('image'), (req, res) => {
  if (process.env.LOCAL === "TRUE") {
    const url = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;
    res.json({ imageUrl: url });
  } else {
    res.json({ imageUrl: req.file.location });
  }
});

export default router;
