import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/index';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';

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

const upload = multer({ storage: storage });

// Middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })
);

app.post('/api/uploads', upload.single('file'), async (req: Request, res: Response) => {
  try {
    // Comprobar si se subió correctamente
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    // Obtener detalles del archivo subido
    const uploadedFileName = req.file.originalname;
    const fileUrl = `/uploads/${encodeURIComponent(uploadedFileName)}`;

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