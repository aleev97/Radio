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
    const [showMoreReactions, setShowMoreReactions] = useState<{ [key: number]: boolean }>({});

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
                        user_id: 1,
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
            const reactionType = reaction.reaction_type;
            if (!acc[reactionType]) {
                acc[reactionType] = { count: 0, users: [] };
            }
            acc[reactionType].count += 1;
            acc[reactionType].users.push(reaction.username);
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
                                const reactionsCount = countReactions(reactions[publication.id!] || {});
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
                                        <div className={styles.reactionsContainer}>
                                            <h4>Reacciones: {totalReactions}</h4>
                                            {totalReactions > 0 ? (
                                                <>
                                                    {Object.entries(reactionsCount).slice(0, showMoreReactions[publication.id!] ? totalReactions : 3).map(([reactionType, { count, users }]) => (
                                                        <div key={reactionType} className={styles.reactionItem}>
                                                            <span>{reactionType}: {count} {users.join(', ')}</span>
                                                        </div>
                                                    ))}
                                                    {totalReactions > 3 && (
                                                        <button onClick={() => setShowMoreReactions(prev => ({ ...prev, [publication.id!]: !prev[publication.id!] }))} className={styles.toggleReactionsButton}>
                                                            {showMoreReactions[publication.id!] ? 'Ver menos' : 'Ver todas las reacciones'}
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <p>No hay reacciones para esta publicación.</p>
                                            )}
                                            <div className={styles.reactionButtons}>
                                                {['👍', '❤️', '🤩', '😥'].map((emoji, index) => {
                                                    const reactionType = ['Me gusta', 'Me encanta', 'Me interesa', 'Me entristece'][index];
                                                    return (
                                                        <button key={reactionType} onClick={() => handleReaction(publication.id!, reactionType)} className={styles.reactionButton}>
                                                            {emoji}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className={styles.commentsContainer}>
                                            <h4>Comentarios: {publication.comments?.length || 0}</h4>
                                            {publication.comments && publication.comments.length > 0 ? (
                                                publication.comments.map((comment) => (
                                                    <div key={comment.id} className={styles.comment}>
                                                        <span className={styles.commentUser}>{comment.username}</span>
                                                        <p className={styles.commentContent}>{comment.content}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No hay comentarios para esta publicación.</p>
                                            )}
                                            <input
                                                type="text"
                                                value={newComment[publication.id!] || ''}
                                                onChange={(e) => handleCommentChange(publication.id!, e.target.value)}
                                                placeholder="Escribe un comentario..."
                                                className={styles.commentInput}
                                            />
                                            <button onClick={() => handleCommentSubmit(publication.id!)} className={styles.commentSubmitButton}>
                                                Comentar
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p>No hay publicaciones para este programa.</p>
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