import React, { useState, useEffect } from 'react';
import { IconEdit, IconX } from './Icons';

export default function EditCourseModal({ isOpen, onClose, onSubmit, course }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Cloud & Architecture',
    courseLevel: 'BEGINNER',
    price: '49.99',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        category: course.category || 'Cloud & Architecture',
        courseLevel: course.courseLevel || 'BEGINNER',
        price: course.price ? String(course.price) : '49.99',
      });
    }
  }, [course]);

  if (!isOpen || !course) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Course title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('description', formData.description.trim());
      payload.append('category', formData.category);
      payload.append('courseLevel', formData.courseLevel);
      payload.append('price', parseFloat(formData.price) || 0);

      await onSubmit(course.courseId, payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update course');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-box">
            <IconEdit size={20} className="modal-header-icon" />
            <h2 className="modal-title">Edit Course</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <IconX size={20} />
          </button>
        </div>

        {error && <div className="modal-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="edit-course-title">Course Title *</label>
            <input
              id="edit-course-title"
              name="title"
              type="text"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-course-desc">Description</label>
            <textarea
              id="edit-course-desc"
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-course-category">Category</label>
              <select
                id="edit-course-category"
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Cloud & Architecture">Cloud & Architecture</option>
                <option value="Web Development">Web Development</option>
                <option value="AI & Data Science">AI & Data Science</option>
                <option value="DevOps & SRE">DevOps & SRE</option>
                <option value="Programming">Programming</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-course-level">Course Level</label>
              <select
                id="edit-course-level"
                name="courseLevel"
                className="form-select"
                value={formData.courseLevel}
                onChange={handleChange}
              >
                <option value="BEGINNER">BEGINNER</option>
                <option value="INTERMEDIATE">INTERMEDIATE</option>
                <option value="ADVANCED">ADVANCED</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-course-price">Price ($ USD)</label>
            <input
              id="edit-course-price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              className="form-input"
              value={formData.price}
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
              id="update-course-btn"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
