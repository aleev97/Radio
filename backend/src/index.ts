import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/index';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear el cuerpo de las solicitudes a formato JSON
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Radio App API!');
});

app.use('/api', userRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 