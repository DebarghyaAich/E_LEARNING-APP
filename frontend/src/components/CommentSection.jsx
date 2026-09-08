import React, { useState, useEffect } from 'react';
import {
  IconMessageSquare,
  IconSend,
  IconHeart,
  IconSparkles,
  IconServer
} from './Icons';
import { fetchComments, addComment, getActiveUser } from '../services/api';

export default function CommentSection({ contentId, lessonTitle, addToast }) {
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [likedComments, setLikedComments] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUser = getActiveUser();

  useEffect(() => {
    if (contentId) {
      loadComments(contentId);
    }
  }, [contentId]);

  const loadComments = async (cId) => {
    const data = await fetchComments(cId);
    setComments(data);
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await addComment(contentId, currentUser.userId, null, newCommentText.trim());
      if (res.success) {
        addToast('Comment posted to InteractionService (:8085)!');
        setNewCommentText('');
        await loadComments(contentId);
      }
    } catch (err) {
      addToast(`Error posting comment: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostReply = async (parentCommentId) => {
    if (!replyText.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await addComment(contentId, currentUser.userId, parentCommentId, replyText.trim());
      if (res.success) {
        addToast('Reply sent to InteractionService (:8085)!');
        setReplyText('');
        setReplyingToId(null);
        await loadComments(contentId);
      }
    } catch (err) {
      addToast(`Error posting reply: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLike = (commentId) => {
    setLikedComments((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="eduwerks-comments-container">
      {/* Header */}
      <div className="comments-header">
        <div className="comments-header-title">
          <IconMessageSquare size={18} className="text-primary" />
          <h4>Lesson Discussion & Questions</h4>
          <span className="comments-count-pill">{comments.length} Threads</span>
        </div>

        <div className="comments-service-pill">
          <span className="live-dot pulse"></span>
          <IconServer size={12} />
          <span>InteractionService (:8085)</span>
        </div>
      </div>

      {/* Main Comment Input Box */}
      <form onSubmit={handlePostComment} className="comment-composer-card">
        <div className="composer-user-avatar">
          <img src={currentUser.avatarUrl} alt={currentUser.firstName} />
        </div>
        <div className="composer-input-area">
          <textarea
            className="composer-textarea"
            placeholder={`Ask a question or share a thought about "${lessonTitle || 'this lesson'}" as ${currentUser.firstName}...`}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            rows={2}
          />
          <div className="composer-toolbar">
            <span className="composer-hint">
              Posting as <strong className="text-primary">{currentUser.firstName} {currentUser.lastName}</strong> ({currentUser.role})
            </span>
            <button
              type="submit"
              className="btn btn-primary btn-sm btn-post-comment"
              disabled={isSubmitting || !newCommentText.trim()}
            >
              <IconSend size={14} />
              <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="comments-stream">
        {comments.length === 0 ? (
          <div className="no-comments-placeholder">
            <IconSparkles size={36} className="text-dim" />
            <p>No questions posted yet for this lesson.</p>
            <span className="text-muted">Be the first to start the classroom conversation!</span>
          </div>
        ) : (
          comments.map((comment) => {
            const isLiked = likedComments.has(comment.commentId);
            const totalLikes = (comment.likes || 0) + (isLiked ? 1 : 0);

            return (
              <div key={comment.commentId} className="comment-thread-card">
                <div className="comment-main-row">
                  <img
                    src={comment.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
                    alt={comment.authorName}
                    className="comment-author-avatar"
                  />
                  <div className="comment-body-block">
                    <div className="comment-meta-bar">
                      <strong className="comment-author-name">{comment.authorName}</strong>
                      <span className={`badge ${comment.authorRole === 'INSTRUCTOR' ? 'badge-sky' : 'badge-emerald'}`}>
                        {comment.authorRole || 'STUDENT'}
                      </span>
                      <span className="comment-timestamp">{formatDate(comment.createdAt)}</span>
                    </div>

                    <p className="comment-text-content">{comment.commentText}</p>

                    <div className="comment-actions-row">
                      <button
                        className={`btn-comment-action ${isLiked ? 'liked' : ''}`}
                        onClick={() => toggleLike(comment.commentId)}
                      >
                        <IconHeart size={14} />
                        <span>{totalLikes > 0 ? totalLikes : 'Like'}</span>
                      </button>

                      <button
                        className="btn-comment-action"
                        onClick={() =>
                          setReplyingToId(replyingToId === comment.commentId ? null : comment.commentId)
                        }
                      >
                        <IconMessageSquare size={14} />
                        <span>Reply</span>
                      </button>
                    </div>

                    {/* Inline Reply Input */}
                    {replyingToId === comment.commentId && (
                      <div className="inline-reply-box">
                        <input
                          type="text"
                          className="inline-reply-input"
                          placeholder={`Reply to ${comment.authorName}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handlePostReply(comment.commentId);
                            }
                          }}
                        />
                        <button
                          className="btn btn-primary btn-xs"
                          onClick={() => handlePostReply(comment.commentId)}
                          disabled={!replyText.trim() || isSubmitting}
                        >
                          Send Reply
                        </button>
                        <button
                          className="btn btn-secondary btn-xs"
                          onClick={() => {
                            setReplyingToId(null);
                            setReplyText('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* Nested Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="nested-replies-list">
                        {comment.replies.map((reply) => (
                          <div key={reply.commentId} className="nested-reply-item">
                            <img
                              src={reply.authorAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80'}
                              alt={reply.authorName}
                              className="reply-author-avatar"
                            />
                            <div className="reply-body-block">
                              <div className="comment-meta-bar">
                                <strong className="comment-author-name">{reply.authorName}</strong>
                                <span className={`badge ${reply.authorRole === 'INSTRUCTOR' ? 'badge-sky' : 'badge-emerald'}`}>
                                  {reply.authorRole || 'STUDENT'}
                                </span>
                                <span className="comment-timestamp">{formatDate(reply.createdAt)}</span>
                              </div>
                              <p className="comment-text-content">{reply.commentText}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
