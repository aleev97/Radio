import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/index';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración multer para la subida de archivos
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads'),
  filename: (req, file, cb) => {
    const uniquePrefix = file.fieldname + '-' + Date.now();
    cb(null, uniquePrefix + '-' + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/; // Aceptar solo imágenes
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimeType && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
  limits: { fileSize: 1024 * 1024 } // Limitar a 1MB
});

// Middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Usar variable de entorno
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })
);

app.post('/api/uploads', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }
    const uploadedFileName = req.file.originalname;
    const fileUrl = `/uploads/${encodeURIComponent(req.file.filename)}`;

    res.json({ message: 'File uploaded successfully', fileUrl });
  } catch (error) {
    console.error('Error during file upload:', error);
    let errorMessage = 'File upload failed';

    res.status(500).json({ error: errorMessage });
  }
});

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api', userRoutes);

app.use((err: any, req: Request, res: Response, nxt: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});