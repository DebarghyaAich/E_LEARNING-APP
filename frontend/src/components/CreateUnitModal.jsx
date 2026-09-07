import React, { useState } from 'react';
import { IconLayers, IconX } from './Icons';

export default function CreateUnitModal({ isOpen, onClose, onSubmit, courseId, nextIndex = 1 }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    unitIndex: nextIndex,
    contentUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Unit title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit(courseId, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        unitIndex: parseInt(formData.unitIndex, 10) || nextIndex,
        contentUrl: formData.contentUrl.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add unit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-box">
            <IconLayers size={20} className="modal-header-icon" />
            <h2 className="modal-title">Add Unit to Curriculum</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <IconX size={20} />
          </button>
        </div>

        {error && <div className="modal-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row-2">
            <div className="form-group" style={{ flex: 3 }}>
              <label className="form-label" htmlFor="unit-title">Unit Title *</label>
              <input
                id="unit-title"
                name="title"
                type="text"
                className="form-input"
                placeholder="e.g. Setting up Spring Cloud Eureka Server"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="unit-index">Index</label>
              <input
                id="unit-index"
                name="unitIndex"
                type="number"
                min="1"
                className="form-input"
                value={formData.unitIndex}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="unit-desc">Lesson Description</label>
            <textarea
              id="unit-desc"
              name="description"
              className="form-textarea"
              placeholder="Outline what this unit covers and key deliverables..."
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="unit-content-url">Content / Stream URL</label>
            <input
              id="unit-content-url"
              name="contentUrl"
              type="text"
              className="form-input"
              placeholder="https://example.com/video.mp4 or doc url"
              value={formData.contentUrl}
              onChange={handleChange}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              id="submit-unit-btn"
            >
              {isSubmitting ? 'Adding...' : 'Add Unit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
