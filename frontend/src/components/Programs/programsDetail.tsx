import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProgramData, Publication } from '../../types';
import styles from './programs.module.css';

const ProgramDetail: React.FC = () => {
    const { programId } = useParams<{ programId: string }>();
    const [program, setProgram] = useState<ProgramData | null>(null);
    const [publications, setPublications] = useState<Publication[]>([]);
    const [error, setError] = useState<string | null>(null);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
    const API_BASE_UPLOADS_URL = import.meta.env.VITE_API_BASE_UPLOADS_URL || '';

    useEffect(() => {
        const fetchProgramDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/programs/${programId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const data: ProgramData = await response.json();
                setProgram(data);
            } catch (error) {
                if (error instanceof Error) {
                    console.error('Error al obtener los detalles del programa:', error.message);
                    setError('No se pudieron obtener los detalles del programa. Inténtelo de nuevo más tarde.');
                }
            }
        };

        const fetchPublications = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/publications/programs/${programId}/publications`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const data: Publication[] = await response.json();
                setPublications(data);
            } catch (error) {
                if (error instanceof Error) {
                    console.error('Error al obtener las publicaciones:', error.message);
                    setError('No se pudieron obtener las publicaciones. Inténtelo de nuevo más tarde.');
                }
            }
        };

        // Ejecutar ambas solicitudes en paralelo
        Promise.all([fetchProgramDetails(), fetchPublications()]);
    }, [programId, API_BASE_URL]);

    return (
        <div className={styles.programContainer}>
            {error && <p className={styles.error}>{error}</p>}
            {program ? (
                <div>
                    <h2 className={styles.title}>{program.titulo}</h2>
                    <p>{program.descripcion}</p>
                    <div className={styles.publications}>
                        <h3>Publicaciones</h3>
                        {publications.length > 0 ? (
                            publications.map((publication) => (
                                <div key={publication.id} className={styles.publicationCard}>
                                    <p className={styles.publicationContent}>{publication.content}</p>
                                    {publication.file_paths.map((filePath, index) => {
                                        const imageUrl = `${API_BASE_UPLOADS_URL}${filePath}`;
                                        return (
                                            <img
                                                key={index}
                                                src={imageUrl}
                                                alt={`Imagen de publicación ${publication.id}`}
                                                className={styles.publicationImage}
                                                onError={(e) => (e.currentTarget.style.display = 'none')} // Ocultar imagen si no se carga
                                            />
                                        );
                                    })}
                                </div>
                            ))
                        ) : (
                            <p>No hay publicaciones disponibles.</p>
                        )}
                    </div>
                </div>
            ) : (
                <p>Cargando detalles del programa...</p>
            )}
        </div>
    );
};

export default ProgramDetail;
