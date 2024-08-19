import React, { useEffect, useState } from 'react';
import { ProgramData } from '../../types';
import ProgramDetails from './programsDetail';

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
        <div>
            <h2>Nuestros Programas</h2>
            <ul>
                {programs.map((program) => (
                    <li key={program.id} onClick={() => handleProgramSelect(program)}>
                        {program.titulo}
                    </li>
                ))}
            </ul>
            
            {selectedProgram && (
                <ProgramDetails program={selectedProgram} />
            )}
        </div>
    );
};

export default Program;
