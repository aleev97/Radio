import React, { useEffect, useState } from 'react';
import { ProgramData } from '../../types';
import ProgramDetails from './programsDetail';
import styles from './programs.module.css';

const Program: React.FC = () => {
    const [programs, setPrograms] = useState<ProgramData[]>([]);
    const [selectedProgram, setSelectedProgram] = useState<ProgramData | null>(null);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const token = localStorage.getItem('token');
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
                console.error('Error fetching programs:', error);
            }
        };
        fetchPrograms();
    }, [API_BASE_URL]);

    const handleProgramSelect = (program: ProgramData) => {
        setSelectedProgram(program);
    };

    return (
        <div className={styles.programContainer}>
            <h2 className={styles.title}>Nuestros Programas</h2>
            <div className={styles.programGrid}>
                {programs.map((program) => (
                    <div
                        key={program.id}
                        className={`${styles.programCard} ${styles[`programCard_${program.id}`]} ${selectedProgram?.id === program.id ? styles.selectedCard : ''}`}
                        onClick={() => handleProgramSelect(program)}
                    >
                        <div className={styles.programInfo}>
                            <h3 className={styles.programTitle}>{program.titulo}</h3>
                        </div>
                    </div>
                ))}
            </div>
            
            {selectedProgram && (
                <ProgramDetails program={selectedProgram} />
            )}
        </div>
    );
};

export default Program;
