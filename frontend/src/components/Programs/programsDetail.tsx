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
    const [editingComment, setEditingComment] = useState<{ id: number; content: string } | null>(null);
    const [showMoreComments, setShowMoreComments] = useState<{ [key: number]: boolean }>({});
    const [reactions, setReactions] = useState<{ [key: number]: Reaction[] }>({});
    const [showMoreReactions] = useState<{ [key: number]: boolean }>({});
    const [showOptions, setShowOptions] = useState<number | null>(null);
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

    const handleCommentEdit = async (commentId?: number, updatedContent?: string, publicationId?: number) => {
        if (!commentId || !updatedContent || !publicationId) {
            console.error('Invalid comment data');
            return;
        }
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content: updatedContent }),
        });

        if (response.ok) {
            const updatedComment = await response.json();
            const updatedPublications = publications.map((pub) => {
                if (pub.id === publicationId) {
                    return {
                        ...pub,
                        comments: pub.comments?.map((comment) =>
                            comment.id === commentId
                                ? { ...comment, content: updatedComment.content }
                                : comment
                        ),
                    };
                }
                return pub;
            });
            setPublications(updatedPublications);
            setEditingComment(null); // Limpiar el estado de edición después de actualizar
        } else {
            console.error('Failed to edit comment');
        }
    };

    const handleCommentDelete = async (commentId: number, publicationId: number) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const updatedPublications = publications.map(pub => {
                if (pub.id === publicationId) {
                    return {
                        ...pub,
                        comments: pub.comments?.filter(comment => comment.id !== commentId),
                    };
                }
                return pub;
            });
            setPublications(updatedPublications);
        } else {
            console.error('Failed to delete comment');
        }
    };

    const toggleShowMoreComments = (publicationId: number) => {
        setShowMoreComments(prev => ({
            ...prev,
            [publicationId]: !prev[publicationId],
        }));
    };

    const handleShowOptions = (commentId: number) => {
        setShowOptions(prev => (prev === commentId ? null : commentId));
    };

    const countReactions = (reactions: Reaction[]) => {
        return reactions.reduce((acc: { [key: string]: { count: number, users: string[] } }, reaction) => {
            const { reaction_type: reactionType, username } = reaction;

            if (!acc[reactionType]) {
                acc[reactionType] = { count: 0, users: [] };
            }

            acc[reactionType].count += 1;

            if (username && !acc[reactionType].users.includes(username)) {
                acc[reactionType].users.push(username);
            }

            return acc;
        }, {});
    };

    const handleReaction = async (publicationId: number, reactionType: string) => {
        const token = localStorage.getItem('token');
        const userId = 1; // Ajusta según el usuario autenticado
        const currentReactions = reactions[publicationId] || [];

        // Verificar si el usuario ya ha reaccionado con el tipo actual o diferente
        const existingReactionIndex = currentReactions.findIndex(
            (reaction) => reaction.user_id === userId
        );
        const existingReaction = existingReactionIndex !== -1 ? currentReactions[existingReactionIndex] : null;

        if (existingReaction) {
            // Si la reacción actual es la misma que la nueva, eliminarla
            if (existingReaction.reaction_type === reactionType) {
                await fetch(`${API_BASE_URL}/publications/${publicationId}/reactions/${existingReaction.id}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setReactions(prev => ({
                    ...prev,
                    [publicationId]: currentReactions.filter((_, i) => i !== existingReactionIndex),
                }));
            } else {
                // Si el usuario elige una reacción diferente, actualizar la reacción
                await fetch(`${API_BASE_URL}/publications/${publicationId}/reactions/${existingReaction.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ type: reactionType }),
                });

                // Actualizar la reacción en el estado con la nueva reacción
                setReactions(prev => ({
                    ...prev,
                    [publicationId]: currentReactions.map((reaction, i) =>
                        i === existingReactionIndex ? { ...reaction, type: reactionType } : reaction
                    ),
                }));
            }
        } else {
            // Si no existe reacción, añadir la nueva reacción
            const response = await fetch(`${API_BASE_URL}/publications/${publicationId}/reactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ type: reactionType }),
            });

            if (response.ok) {
                const newReaction = await response.json();
                setReactions(prev => ({
                    ...prev,
                    [publicationId]: [...currentReactions, newReaction],
                }));
            }
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
                return '';
        }
    };

    return (
        <div className={styles.programContainer}>
            {error && <p className={styles.error}>{error}</p>}
            {program ? (
                <div className={styles.programDetail}>
                    <h2 className={styles.title}>{program.titulo}</h2>
                    <p className={styles.description}>{program.descripcion}</p>
                    <hr />
                    <div className={styles.publications}>
                        <h3 className={styles.publications_Titulo}>Publicaciones</h3>
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
                                        <div className={styles.reactionsContainer}>
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
                                                                    {[
                                                                        { emoji: '👍', type: 'Me gusta' },
                                                                        { emoji: '❤️', type: 'Me encanta' },
                                                                        { emoji: '😲', type: 'Me interesa' },
                                                                        { emoji: '😥', type: 'Me entristece' },
                                                                    ]
                                                                        .find((reaction) => reaction.type === reactionType)?.emoji}
                                                                    {' '}
                                                                    {reactionType}: {count} ({users.slice(0, 3).join(', ')})
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
                                        </div>
                                        {publication.comments && publication.comments.length > 0 && (
                                            <div className={styles.comments_Container}>
                                                <h4>Comentarios: {publication.comments.length}</h4>
                                                {(showMoreComments[publication.id!] ? publication.comments : publication.comments.slice(0, 1))
                                                    .sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime()) // Ordenar de más antiguo a más reciente
                                                    .map((comment) => (
                                                        <div key={comment.id} className={styles.comment}>
                                                            <span className={styles.commentUser}>{comment.username}</span>
                                                            <span className={styles.commentDate}>
                                                                {comment.update_at
                                                                    ? `Editado el ${new Date(comment.update_at).toLocaleString()}` // Mostrar la fecha de actualización
                                                                    : new Date(comment.created_at!).toLocaleString()}
                                                            </span>
                                                            {editingComment?.id === comment.id && (
                                                                <span className={styles.editedTag}> (Editado)</span>
                                                            )}
                                                            {editingComment?.id === comment.id ? (
                                                                <div className={styles.editCommentContainer}>
                                                                    <input
                                                                        type="text"
                                                                        value={editingComment?.content || ''}
                                                                        onChange={(e) =>
                                                                            editingComment && setEditingComment({ ...editingComment, content: e.target.value })
                                                                        }
                                                                        className={styles.commentEditInput}
                                                                    />
                                                                    <div className={styles.editActions}>
                                                                        <button
                                                                            className={styles.saveButton}
                                                                            onClick={() => handleCommentEdit(editingComment?.id, editingComment?.content, publication.id!)}
                                                                        >
                                                                            Guardar
                                                                        </button>
                                                                        <button
                                                                            className={styles.cancelButton}
                                                                            onClick={() => setEditingComment(null)}
                                                                        >
                                                                            Cancelar
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <p className={styles.commentContent}>{comment.content}</p>
                                                            )}
                                                            <button
                                                                className={styles.optionsButton}
                                                                onClick={() => handleShowOptions(comment.id!)}
                                                            >
                                                                ⋮
                                                            </button>
                                                            {showOptions === comment.id && (
                                                                <div className={styles.commentActions}>
                                                                    <button
                                                                        className={styles.editButton}
                                                                        onClick={() =>
                                                                            setEditingComment({
                                                                                id: comment.id!,
                                                                                content: comment.content,
                                                                            })
                                                                        }
                                                                    >
                                                                        Editar
                                                                    </button>
                                                                    <button
                                                                        className={styles.deleteButton}
                                                                        onClick={() => handleCommentDelete(comment.id!, publication.id!)}
                                                                    >
                                                                        Eliminar
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                {publication.comments.length > 1 && (
                                                    <button
                                                        className={styles.toggleCommentsButton}
                                                        onClick={() => toggleShowMoreComments(publication.id!)}
                                                    >
                                                        {showMoreComments[publication.id!] ? 'menos 💬' : 'más 💬'}
                                                    </button>
                                                )}
                                                <input
                                                    type="text"
                                                    value={newComment[publication.id!] || ''}
                                                    onChange={(e) => handleCommentChange(publication.id!, e.target.value)}
                                                    placeholder="Escribe un comentario..."
                                                    className={styles.commentInput}
                                                />
                                                <button
                                                    onClick={() => handleCommentSubmit(publication.id!)}
                                                    className={styles.commentSubmitButton}
                                                >
                                                    Comentar
                                                </button>
                                            </div>
                                        )}
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