import React, { useState, useRef } from 'react';
import {
  IconX,
  IconUpload,
  IconVideo,
  IconClock,
  IconFileText,
  IconSparkles
} from './Icons';

export default function UploadContentModal({
  isOpen,
  onClose,
  onSubmit,
  courseId,
  unitId,
  unitTitle,
  nextLessonIndex = 1
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lessonIndex, setLessonIndex] = useState(String(nextLessonIndex));
  const [duration, setDuration] = useState(300); // 5 mins in seconds
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Format seconds to MM:SS
  const formatDurationDisplay = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs > 0 ? `${secs}s` : ''}`.trim() || '0s';
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file) => {
    setSelectedFile(file);
    const preview = URL.createObjectURL(file);
    setFilePreviewUrl(preview);

    // Auto-fill title if empty
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a lesson title.');
      return;
    }

    if (!selectedFile) {
      alert('Please choose a video or document media file to upload to ContentService.');
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadProgress(25);

      const formData = new FormData();
      formData.append('courseId', courseId);
      formData.append('unitId', unitId);
      formData.append('lessonIndex', lessonIndex);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('duration', duration);
      formData.append('file', selectedFile);
      if (filePreviewUrl) {
        formData.append('previewUrl', filePreviewUrl);
      }

      setUploadProgress(65);
      await onSubmit(courseId, unitId, formData);
      setUploadProgress(100);

      // Reset and close
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setSelectedFile(null);
        setFilePreviewUrl(null);
        setIsSubmitting(false);
        setUploadProgress(0);
        onClose();
      }, 400);

    } catch (err) {
      console.error('Upload failed:', err);
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card glass-card upload-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-icon-box">
            <IconVideo size={24} className="text-azure" />
          </div>
          <div>
            <h2 className="modal-title">Upload Lesson & Media</h2>
            <p className="modal-subtitle">
              Adding lesson to <span className="highlight-tag">{unitTitle || `Unit ${unitId}`}</span> via <strong>ContentService (8083)</strong>
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <IconX size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* File Drag and Drop Zone */}
          <div className="form-group">
            <label className="form-label">
              Lesson Media File (Video MP4/WebM, Document PDF) *
            </label>
            <div
              className={`file-dropzone ${isDragging ? 'drag-active' : ''} ${selectedFile ? 'file-ready' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="video/*,application/pdf,.mkv,.mp4,.webm"
                style={{ display: 'none' }}
              />

              {selectedFile ? (
                <div className="dropzone-file-selected">
                  <div className="file-badge">
                    <IconVideo size={28} />
                  </div>
                  <div className="file-info-text">
                    <strong>{selectedFile.name}</strong>
                    <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for MinIO Object Storage</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm change-file-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Change File
                  </button>
                </div>
              ) : (
                <div className="dropzone-empty">
                  <div className="dropzone-icon-ring">
                    <IconUpload size={32} />
                  </div>
                  <h4>Drag & Drop media here or <span className="text-azure">browse computer</span></h4>
                  <p>Supports MP4, WebM, MKV, PDF. Automatically streamed to MinIO S3 bucket <code>content-files</code>.</p>
                </div>
              )}
            </div>
          </div>

          {/* Row 1: Title & Lesson Index */}
          <div className="form-row-2">
            <div className="form-group flex-1">
              <label className="form-label" htmlFor="lesson-title">Lesson Title *</label>
              <input
                id="lesson-title"
                type="text"
                className="form-input"
                placeholder="e.g. Setting Up Netflix Eureka Server"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group w-32">
              <label className="form-label" htmlFor="lesson-index">Lesson Index *</label>
              <input
                id="lesson-index"
                type="text"
                className="form-input text-center font-bold"
                placeholder="1"
                value={lessonIndex}
                onChange={(e) => setLessonIndex(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Row 2: Duration Slider / Input */}
          <div className="form-group">
            <div className="duration-label-row">
              <label className="form-label" htmlFor="lesson-duration">
                <IconClock size={16} />
                <span>Estimated Duration:</span>
                <span className="duration-pill">{formatDurationDisplay(duration)} ({duration} secs)</span>
              </label>
            </div>
            <div className="duration-slider-box">
              <input
                id="lesson-duration"
                type="range"
                min="60"
                max="3600"
                step="30"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                className="duration-range-input"
              />
              <div className="range-ticks">
                <span>1 min</span>
                <span>15 mins</span>
                <span>30 mins</span>
                <span>60 mins</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="lesson-desc">Lesson Synopsis & Notes</label>
            <textarea
              id="lesson-desc"
              className="form-textarea"
              rows={3}
              placeholder="Detailed lesson overview, key takeaways, and prerequisites covered..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Microservices Architecture Banner */}
          <div className="upload-microservice-tip">
            <IconSparkles size={16} className="tip-sparkle" />
            <span>
              Validated across <strong>CourseService</strong> & <strong>UnitService</strong> via OpenFeign, then persisted in <code>elearning-content</code> PostgreSQL & MinIO.
            </span>
          </div>

          {/* Upload Progress Bar */}
          {isSubmitting && (
            <div className="upload-progress-box">
              <div className="upload-progress-info">
                <span>Uploading to MinIO Object Storage...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="upload-progress-track">
                <div
                  className="upload-progress-bar"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Actions */}
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
            >
              <IconUpload size={18} />
              <span>{isSubmitting ? 'Uploading Media...' : 'Upload Lesson Content'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
