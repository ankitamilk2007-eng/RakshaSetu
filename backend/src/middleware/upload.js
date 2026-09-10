import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitized}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images, PDFs, docs, audio, video, text/chats
  const allowedExtensions = /\.(jpg|jpeg|png|gif|pdf|docx|doc|txt|mp3|wav|ogg|mp4|webm|m4a)$/i;
  if (file.originalname.match(allowedExtensions)) {
    cb(null, true);
  } else {
    cb(new Error('File format not supported. Allowed: Images, PDFs, Docs, Audio, Video, Chat Exports.'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter
});
