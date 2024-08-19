import React from 'react';
import { ProgramDetailsProps } from '../../types';

const ProgramDetails: React.FC<ProgramDetailsProps> = ({ program }) => {
    return (
        <div>
            <h3>{program.titulo}</h3>
            <p>{program.descripcion}</p>
        </div>
    );
};

export default ProgramDetails;