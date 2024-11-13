import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProgramData, Publication, Reaction, Comment } from '../../types';
import styles from './programs.module.css';

const ProgramDetail: React.FC = () => {
    const { programId } = useParams<{ programId: string }>();
    const [program, setProgram] = useState<ProgramData | null>(null);
    const [publications, setPublications] = useState<Publication[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
    const [reactions, setReactions] = useState<{ [key: number]: Reaction[] }>({});
    const [showMoreReactions] = useState<{ [key: number]: boolean }>({});
    const [modalVisible, setModalVisible] = useState<{ [key: number]: boolean }>({});

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
                const initialReactions: { [key: number]: Reaction[] } = {};
                data.forEach(publication => {
                    initialReactions[publication.id!] = publication.reactions || [];
                });
                setReactions(initialReactions);
            } catch (error) {
                if (error instanceof Error) {
                    console.error('Error al obtener las publicaciones:', error.message);
                    setError('No se pudieron obtener las publicaciones. Inténtelo de nuevo más tarde.');
                }
            }
        };

        Promise.all([fetchProgramDetails(), fetchPublications()]);
    }, [programId, API_BASE_URL]);

    const handleCommentChange = (publicationId: number, value: string) => {
        setNewComment(prev => ({ ...prev, [publicationId]: value }));
    };

    const handleCommentSubmit = async (publicationId: number) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/publications/${publicationId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content: newComment[publicationId] }),
        });

        if (response.ok) {
            const updatedPublications = publications.map(pub => {
                if (pub.id === publicationId) {
                    const newCommentObj: Comment = {
                        publication_id: pub.id!,
                        user_id: 1, // Ajusta esto según el usuario autenticado
                        content: newComment[publicationId],
                        created_at: new Date(),
                    };
                    return {
                        ...pub,
                        comments: [...(pub.comments || []), newCommentObj]
                    };
                }
                return pub;
            });
            setPublications(updatedPublications);
            setNewComment(prev => ({ ...prev, [publicationId]: '' }));
        }
    };

    const countReactions = (reactions: Reaction[]) => {
        return reactions.reduce((acc: { [key: string]: { count: number, users: string[] } }, reaction) => {
            const { reaction_type: reactionType, username } = reaction;

            if (!acc[reactionType]) {
                acc[reactionType] = { count: 0, users: [] };
            }

            acc[reactionType].count += 1;

            // Añadimos el usuario solo si no está vacío o ya en la lista, para evitar duplicados y vacíos
            if (username && !acc[reactionType].users.includes(username)) {
                acc[reactionType].users.push(username);
            }

            return acc;
        }, {});
    };


    const handleReaction = async (publicationId: number, reactionType: string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/publications/${publicationId}/reactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ type: reactionType }),
        });

        if (response.ok) {
            const updatedReactions = await response.json();
            setReactions(prev => ({
                ...prev,
                [publicationId]: updatedReactions,
            }));
        }
    };

    const toggleModal = (publicationId: number) => {
        setModalVisible(prev => ({ ...prev, [publicationId]: !prev[publicationId] }));
    };

    const getReactionClass = (reactionType: string) => {
        switch (reactionType) {
            case 'Me gusta':
                return styles.reactionLike;
            case 'Me encanta':
                return styles.reactionLove;
            case 'Me interesa':
                return styles.reactionInterest;
            case 'Me entristece':
                return styles.reactionSad;
            default:
                return ''; // Clase por defecto si no coincide
        }
    };

    return (
        <div className={styles.programContainer}>
            {error && <p className={styles.error}>{error}</p>}
            {program ? (
                <div className={styles.programDetail}>
                    <h2 className={styles.title}>{program.titulo}</h2>
                    <p className={styles.description}>{program.descripcion}</p>
                    <div className={styles.publications}>
                        <h3>Publicaciones</h3>
                        {publications.length > 0 ? (
                            publications.map((publication) => {
                                const reactionsCount = countReactions(reactions[publication.id!] || []);
                                const totalReactions = Object.values(reactionsCount).reduce((total, { count }) => total + count, 0);

                                return (
                                    <div key={publication.id} className={styles.publicationCard}>
                                        <div className={styles.publicationHeader}>
                                            <span className={styles.publicationUser}>{publication.username}</span>
                                            <span className={styles.publicationDate}>{new Date(publication.created_at || '').toLocaleString()}</span>
                                        </div>
                                        <p className={styles.publicationContent}>{publication.content}</p>
                                        <div className={styles.publicationImages}>
                                            {publication.file_paths.map((filePath, index) => {
                                                const imageUrl = `${API_BASE_UPLOADS_URL}${filePath}`;
                                                return (
                                                    <img
                                                        key={index}
                                                        src={imageUrl}
                                                        alt={`Imagen de publicación ${publication.id}`}
                                                        className={styles.publicationImage}
                                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <div className={styles.reactionButtons}>
                                            {[
                                                { emoji: '👍', type: 'Me gusta' },
                                                { emoji: '❤️', type: 'Me encanta' },
                                                { emoji: '😲', type: 'Me interesa' },
                                                { emoji: '😥', type: 'Me entristece' },
                                            ].map(({ emoji, type }) => (
                                                <button
                                                    key={type}
                                                    onClick={() => handleReaction(publication.id!, type)}
                                                    className={styles.reactionButton}
                                                    aria-label={`Reacción: ${type}`}
                                                >
                                                    <span className={styles.emoji}>{emoji}</span>
                                                    <span className={styles.tooltip}>{type}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <h4>Reacciones: {totalReactions}</h4>
                                        {totalReactions > 0 ? (
                                            <>
                                                {Object.entries(reactionsCount)
                                                    .slice(0, showMoreReactions[publication.id!] ? totalReactions : 2)
                                                    .map(([reactionType, { count, users }]) => (
                                                        <div key={reactionType} className={styles.reactionItem}>
                                                            <span>
                                                                {/* Mostrar el emoji junto al tipo de reacción */}
                                                                {[
                                                                    { emoji: '👍', type: 'Me gusta' },
                                                                    { emoji: '❤️', type: 'Me encanta' },
                                                                    { emoji: '😲', type: 'Me interesa' },
                                                                    { emoji: '😥', type: 'Me entristece' },
                                                                ]
                                                                    .find((reaction) => reaction.type === reactionType)?.emoji}
                                                                {' '}
                                                                {reactionType}: {count} {users.slice(0, 3).join(', ')}
                                                            </span>
                                                            {users.length > 3 && (
                                                                <span className={styles.moreUsers}>
                                                                    {' '}
                                                                    y otros {users.length - 3} usuarios
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                {totalReactions > 3 && (
                                                    <button
                                                        onClick={() => toggleModal(publication.id!)}
                                                        className={styles.reactionModalButton}
                                                    >
                                                        <span>Ver todas las reacciones</span>
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <span>No hay reacciones todavía.</span>
                                        )}
                                        {modalVisible[publication.id!] && (
                                            <div className={styles.modal}>
                                                <div className={styles.modalContent}>
                                                    <span
                                                        className={styles.closeModalButton}
                                                        onClick={() => toggleModal(publication.id!)}
                                                    >
                                                        &times;
                                                    </span>
                                                    <div className={styles.reactionHeader}>
                                                        <h3 className={styles.modalTitle}>Reacciones: {totalReactions}</h3>
                                                        <div className={styles.reactions}>
                                                            {Object.entries(reactionsCount).map(([reactionType, { count, users }]) => (
                                                                <div key={reactionType} className={styles.reactionItems}>
                                                                    <span className={getReactionClass(reactionType)}>
                                                                        {[{ emoji: '👍', type: 'Me gusta' },
                                                                        { emoji: '❤️', type: 'Me encanta' },
                                                                        { emoji: '😲', type: 'Me interesa' },
                                                                        { emoji: '😥', type: 'Me entristece' }]
                                                                            .find((reaction) => reaction.type === reactionType)?.emoji}
                                                                        {' '}
                                                                        {reactionType}: {count}
                                                                    </span>
                                                                    <div className={styles.separatorLine}></div>
                                                                    <div className={styles.usersList}>
                                                                        {users.map((user, index) => (
                                                                            <div key={index} className={styles.user}>
                                                                                {user}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className={styles.comments}>
                                            <h4>Comentarios</h4>
                                            {publication.comments?.map((comment, index) => (
                                                <div key={index} className={styles.comment}>
                                                    <span className={styles.commentUser}>{comment.username}</span>
                                                    <span className={styles.commentContent}>{comment.content}</span>
                                                </div>
                                            ))}
                                            <div className={styles.newComment}>
                                                <input
                                                    type="text"
                                                    placeholder="Agregar un comentario..."
                                                    value={newComment[publication.id!] || ''}
                                                    onChange={(e) => handleCommentChange(publication.id!, e.target.value)}
                                                />
                                                <button onClick={() => handleCommentSubmit(publication.id!)}>Enviar</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
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
