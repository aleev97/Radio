import React, { useState } from 'react';
import styles from './Navbar.module.css';
import { NavBarProps } from '../../types';
import { Link } from "react-router-dom";

const NavBar: React.FC<NavBarProps> = () => { // Corregir aquí

    const [isOpen, setIsOpen] = useState(false);

    const toggleNavbar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <button className={`${styles.btn} ${isOpen ? styles.btn_open : ''}`} onClick={toggleNavbar}>
                <span>{isOpen ? 'Cerrar' : 'Abrir'} menú</span>
                <svg width="15px" height="10px" viewBox="0 0 13 10">
                    <path d={isOpen ? "M11,5 L1,5": "M1,5 L11,5" }></path>
                    <polyline points={isOpen ? "4 1 0 5 4 9": "8 1 12 5 8 9"}></polyline>
                </svg>
            </button>

            <nav className={`${styles.nav} ${isOpen ? styles.open : ''}`}>
                <div className={styles.nav_shape}></div>
                <div className={styles.nav_close} onClick={toggleNavbar}>
                    <i className="bx bx-x"></i>
                </div>
                <Link to="/home" className={styles.nav_mask}>
                    <img src="/imagenes/compLanding/logo.jpg" alt="Logo" className={styles.nav_img} />
                </Link>
                <ul className={styles.nav_list}>
                    <li className={styles.nav_item}>
                        <Link to="/home" className={`${styles.nav_link} ${styles.active_link}`}>Inicio</Link>
                    </li>
                    <li className={styles.nav_item}>
                        <Link to="/programas" className={styles.nav_link}>Programas</Link>
                    </li>
                    <li className={styles.nav_item}>
                        <Link to="/sobreNosotros" className={styles.nav_link}>Sobre Nosotros</Link>
                    </li>
                    <li className={styles.nav_item}>
                        <Link to="/Eventos" className={styles.nav_link}>Eventos</Link>
                    </li>
                    <li className={styles.nav_item}>
                        <Link to="/contactos" className={styles.nav_link}>Contactos</Link>
                    </li>
                        <li className={styles.nav_item}>
                            <Link to="/perfil" className={styles.nav_link}>Perfil</Link>
                        </li>
                </ul>
            </nav>
        </>
    );
}

export default NavBar;
