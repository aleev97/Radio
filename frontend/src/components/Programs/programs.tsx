import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPrograms } from '../../Redux/Reducers/programsReducers';
import { RootState, AppDispatch } from '../../Redux/store'; 
import styles from './program.module.css';

const Program: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { programs, loading, error } = useSelector((state: RootState) => state.program);

    useEffect(() => {
        dispatch(fetchPrograms());
    }, [dispatch]);

    const handleProgramSelect = (programId: number) => {
        navigate(`/programas/${programId}`);
    };

    const isLoading = loading;
    const hasError = error;

    return (
        <div className={styles.programContainer}>
            <h2 className={styles.titulo}>Nuestros Programas</h2>
            {isLoading && <p>Cargando programas...</p>}
            {hasError && <p className={styles.error}>Error: {hasError}</p>}
            <div className={styles.programGrid}>
                {programs.map((program) => (
                    <div
                        key={program.id}
                        className={`${styles.programCard} ${styles[`programCard_${program.id}`]}`}
                        onClick={() => handleProgramSelect(program.id)}
                    >
                        <div className={styles.programInfo}>
                            <h3 className={styles.programTitulo}>{program.titulo}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Program;