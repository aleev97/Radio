import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProgramData, Publication } from '../../types';
import styles from './programs.module.css';

const ProgramDetail: React.FC = () => {
    const { programId } = useParams<{ programId: string }>();
    const [program, setProgram] = useState<ProgramData | null>(null);
    const [publications, setPublications] = useState<Publication[]>([]);
    
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
                console.error('Error fetching program details:', error);
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
                console.error('Error fetching publications:', error);
            }
        };        

        fetchProgramDetails();
        fetchPublications();
    }, [programId, API_BASE_URL]);

    return (
        <div className={styles.programPage}>
            {program ? (
                <div>
                    <h2>{program.titulo}</h2>
                    <p>{program.descripcion}</p>
                    <div className={styles.publications}>
                        <h3>Publicaciones</h3>
                        {publications.length > 0 ? (
                            publications.map((publication) => (
                                <div key={publication.id} className={styles.publicationCard}>
                                    <p>{publication.content}</p>
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