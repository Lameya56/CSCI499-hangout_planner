import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from "@aws-sdk/client-s3";

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
  // AWS SDK v3 client
  const s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
    region: process.env.AWS_REGION,
  });

  storage = multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET,
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


