import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

const query = async (text: string, params: any[] = []): Promise<QueryResult> => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error: any) {  // Tipo explícito para la variable error
    // Manejo de errores aquí
    console.error('Error executing query:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

export default {
  query,
}; 