import React, { useState } from 'react';
import styles from './Navbar.module.css';

const NavBar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleNavbar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <button className={`${styles.btn} ${isOpen ? styles.btn_open : ''}`} onClick={toggleNavbar}>
                <span>{isOpen ? 'Cerrar' : 'Abrir'} menu</span>
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
                <div className={styles.nav_data}></div>
                <div className={styles.nav_mask}>
                <img src="/imagenes/compLanding/logo.jpg" alt="Logo" className={styles.nav_img} />
                </div>
                <ul className={styles.nav_list}>
                    <li className={styles.nav_item}>
                        <a href="#inicio" className={`${styles.nav_link} ${styles.active_link}`}>Inicio</a>
                    </li>
                    <li className={styles.nav_item}>
                        <a href="#programas" className={styles.nav_link}>Programas</a>
                    </li>
                    <li className={styles.nav_item}>
                        <a href="#sobreNosotros" className={styles.nav_link}>Sobre Nosotros</a>
                    </li>
                    <li className={styles.nav_item}>
                        <a href="#Eventos" className={styles.nav_link}>Eventos</a>
                    </li>
                    <li className={styles.nav_item}>
                        <a href="#contactos" className={styles.nav_link}>Contactos</a>
                    </li>
                    <li className={styles.nav_item}>
                        <a href="#perfil" className={styles.nav_link}>Perfil</a>
                    </li>
                </ul>
            </nav>
        </>
    );
}

export default NavBar;