import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgramData } from '../../types';
import styles from './programs.module.css';

const Program: React.FC = () => {
    const [programs, setPrograms] = useState<ProgramData[]>([]);
    const navigate = useNavigate();

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const response = await fetch(`${API_BASE_URL}/programs`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const data: ProgramData[] = await response.json();
                setPrograms(data);
            } catch (error) {
                if (error instanceof Error) {
                    console.error('Error fetching programs:', error.message);
                } else {
                    console.error('Unexpected error:', error);
                }
            }
        };

        fetchPrograms();
    }, [API_BASE_URL]);

    const handleProgramSelect = (programId: number) => {
        navigate(`/programas/${programId}`);
    };

    return (
        <div className={styles.programContainer}>
            <h2 className={styles.title}>Nuestros Programas</h2>
            <div className={styles.programGrid}>
                {programs.map((program) => ( 
                    <div
                        key={program.id}
                        className={`${styles.programCard} ${styles[`programCard_${program.id}`]}`}
                        onClick={() => handleProgramSelect(program.id)}
                    >
                        <div className={styles.programInfo}>
                            <h3 className={styles.programTitle}>{program.titulo}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Program;