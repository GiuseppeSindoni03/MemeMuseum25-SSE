import "./MemeCard.css";
import { IoThumbsDownOutline, IoThumbsUpOutline } from "react-icons/io5";
import { GoComment } from "react-icons/go";
import { createOrUpdateVote } from "../../services/voteService";
import {
  fetchComments,
  postComment,
  deleteComment,
} from "../../services/commentService";
import { getMemeById, deleteMeme } from "../../services/memeService";
import { useAuth } from "../../services/AuthContext";
import { useState } from "react";
import { IoPerson, IoTrashOutline } from "react-icons/io5";
import { handleApiError } from "../../utility/handleApiError";
import { FaUserCircle } from "react-icons/fa";

export default function MemeCard({
  memeId,
  title,
  author,
  date,
  imageUrl,
  tags,
  likes,
  dislikes,
  commentsCount,
  userVote,
  onUpdate,
  onClickNotLogged,
  onDeleteMeme,
}) {
  const { user, isLoggedIn } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");

  const handleToggleComments = async () => {
    if (!showComments) {
      setLoading(true);
      try {
        const data = await fetchComments(memeId);
        setComments(data);
      } catch (err) {
        handleApiError(err, onClickNotLogged);
      } finally {
        setLoading(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleVote = async (memeId, type) => {
    try {
      await createOrUpdateVote(memeId, type);
      const updatedMeme = await getMemeById(memeId);
      onUpdate(updatedMeme);
    } catch (err) {
      handleApiError(err, onClickNotLogged);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      await postComment(memeId, newComment);
      const updatedMeme = await getMemeById(memeId);
      onUpdate(updatedMeme);
      const commentsUpdates = await fetchComments(memeId);
      setComments(commentsUpdates);
      setNewComment("");
    } catch (err) {
      handleApiError(err, onClickNotLogged);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmed = window.confirm(
      "Sei sicuro di voler eliminare questo contenuto?"
    );
    if (!confirmed) return;

    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      const updatedMeme = await getMemeById(memeId);
      onUpdate(updatedMeme);
    } catch (err) {
      handleApiError(err, onClickNotLogged);
    }
  };

  const handleDeleteMeme = async (memeId) => {
    const confirmed = window.confirm(
      "Sei sicuro di voler eliminare questo contenuto?"
    );
    if (!confirmed) return;

    try {
      await deleteMeme(memeId);
      onDeleteMeme(memeId);
    } catch (err) {
      handleApiError(err, onClickNotLogged);
    }
  };

  return (
    <div className="meme-card">
      {author === user?.username && (
        <button
          className="delete-button-floating"
          onClick={() => handleDeleteMeme(memeId)}
          title="Elimina Meme"
        >
          <IoTrashOutline />
        </button>
      )}
      <div className="meme-header">
        <div className="title">{title}</div>

        <div className="meme-meta-row">
          <div className="author-info">
            <FaUserCircle className="avatar" />
            
            <div className="meta">
              {author} · {new Date(date).toLocaleString()}
            </div>
          </div>

          <div className="meme-tags">
            {tags.map((tag, i) => (
              <span key={i} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="meme-image">
        <img src={imageUrl} alt="blurred bg" className="meme-image-bg" loading="lazy" />
        <img src={imageUrl} alt={title} className="meme-image-foreground" loading="lazy" />
      </div>

      <div className="meme-footer">
        <div
          className={`action ${userVote === "UP" ? "selected" : ""}`}
          onClick={() => {
            if (isLoggedIn) handleVote(memeId, "UP");
            else onClickNotLogged();
          }}
        >
          <span>
            <IoThumbsUpOutline />
          </span>{" "}
          {likes}
        </div>
        <div
          className={`action ${userVote === "DOWN" ? "selected" : ""}`}
          onClick={() => {
            if (isLoggedIn) handleVote(memeId, "DOWN");
            else onClickNotLogged();
          }}
        >
          <span>
            <IoThumbsDownOutline />
          </span>{" "}
          {dislikes}
        </div>
        <div className="action" onClick={handleToggleComments}>
          <span>
            <GoComment />
          </span>{" "}
          {commentsCount}
        </div>
      </div>
      {showComments && (
        <div className="comments-section">
          {loading ? (
            <p>Caricamento commenti...</p>
          ) : commentsCount === 0 ? (
            <p>Nessun commento disponibile.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-icon">
                    <IoPerson />
                  </span>
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                  {comment.author === user?.username && (
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteComment(comment.id)}
                      title="Elimina commento"
                    >
                      <IoTrashOutline />
                    </button>
                  )}
                </div>

                <div className="comment-body">{comment.text}</div>
              </div>
            ))
          )}

          
          <div className="new-comment">
            <textarea
              placeholder="Scrivi un commento..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button
              onClick={() => {
                if (isLoggedIn) handleSubmitComment();
                else onClickNotLogged();
              }}
            >
              Invia
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
