import React, { useState } from 'react';
import styles from './Navbar.module.css';
import image from '../../../public/imagenes/compLanding/logo.jpg';

const NavBar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleNavbar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <button className={styles.btn} onClick={toggleNavbar}>
                {isOpen ? 'Cerrar' : 'Abrir'} menu
            </button>
            <nav className={`${styles.nav} ${isOpen ? styles.open : ''}`}>
                <div className={styles.nav_shape}></div>
                <div className={styles.nav_close} onClick={toggleNavbar}>
                    <i className="bx bx-x"></i>
                </div>
                <div className={styles.nav_data}></div>
                <div className={styles.nav_mask}>

                    <img src={image} alt="Logo" className={styles.nav_img} />
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