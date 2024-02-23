import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface UserData {
  username: string;
  email: string;
  isadmin: boolean;
}

const Home: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get<UserData>('http://localhost:3000/api/user', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setUserData(response.data);
        } else {
          console.log('No se encontró ningún token en el localStorage');
        }
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Bienvenido a tu página de inicio</h1>
      {userData && (
        <div>
          <h2>Información del usuario:</h2>
          <p>Nombre de usuario: {userData.username}</p>
          <p>Email: {userData.email}</p>
          <p>¿Es administrador? {userData.isadmin ? 'Sí' : 'No'}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
