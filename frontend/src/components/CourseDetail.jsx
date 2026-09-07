import React, { useState, useEffect } from 'react';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBook,
  IconCheck,
  IconCheckCircle,
  IconClock,
  IconFileText,
  IconLayers,
  IconPlay,
  IconPlus,
  IconMinus,
  IconVideo,
  IconSparkles,
  IconUpload,
  IconEdit,
  IconDollar
} from './Icons';

export default function CourseDetail({
  course,
  units = [],
  onBack,
  onOpenCreateUnit,
  onOpenUploadContent,
  onEditCourse
}) {
  // Active Unit & Lesson Indices
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
  const [selectedContentIndex, setSelectedContentIndex] = useState(0);
  const [expandedUnitIds, setExpandedUnitIds] = useState(new Set());
  const [completedContents, setCompletedContents] = useState(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'resources' | 'microservice'

  // Derive active Unit
  const activeUnit = units[selectedUnitIndex] || null;
  const activeContents = activeUnit?.contents || [];
  const activeContent = activeContents[selectedContentIndex] || null;

  // Calculate total lessons and progress
  const totalLessons = units.reduce((acc, u) => acc + (u.contents?.length || 0), 0);
  const completedCount = completedContents.size;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Reset lesson index when switching units if out of bounds
  useEffect(() => {
    setSelectedContentIndex(0);
    setIsPlaying(false);
  }, [selectedUnitIndex]);

  // Format seconds to MM:SS
  const formatDuration = (secs) => {
    if (!secs) return '0:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Toggle completion of a lesson
  const toggleContentComplete = (contentId) => {
    setCompletedContents((prev) => {
      const next = new Set(prev);
      if (next.has(contentId)) {
        next.delete(contentId);
      } else {
        next.add(contentId);
      }
      return next;
    });
  };

  // Toggle expand/collapse of a unit (Plus <-> Minus toggle)
  const toggleUnitExpand = (unitKey, uIdx) => {
    setSelectedUnitIndex(uIdx);
    setExpandedUnitIds((prev) => {
      const next = new Set(prev);
      if (next.has(unitKey)) {
        next.delete(unitKey);
      } else {
        next.add(unitKey);
      }
      return next;
    });
  };

  // Navigate to Next Lesson (across units seamlessly)
  const handleNextLesson = () => {
    if (selectedContentIndex < activeContents.length - 1) {
      setSelectedContentIndex(selectedContentIndex + 1);
    } else if (selectedUnitIndex < units.length - 1) {
      const nextUIdx = selectedUnitIndex + 1;
      const nextUnit = units[nextUIdx];
      const nextKey = nextUnit?.unitId || `unit-${nextUIdx}`;
      setSelectedUnitIndex(nextUIdx);
      setSelectedContentIndex(0);
      setExpandedUnitIds((prev) => new Set([...prev, nextKey]));
    }
  };

  // Navigate to Prev Lesson
  const handlePrevLesson = () => {
    if (selectedContentIndex > 0) {
      setSelectedContentIndex(selectedContentIndex - 1);
    } else if (selectedUnitIndex > 0) {
      const prevUIdx = selectedUnitIndex - 1;
      const prevUnit = units[prevUIdx];
      const prevKey = prevUnit?.unitId || `unit-${prevUIdx}`;
      setSelectedUnitIndex(prevUIdx);
      setSelectedContentIndex((prevUnit.contents?.length || 1) - 1);
      setExpandedUnitIds((prev) => new Set([...prev, prevKey]));
    }
  };

  const isLastLesson =
    selectedUnitIndex === units.length - 1 &&
    selectedContentIndex === activeContents.length - 1;

  const isFirstLesson = selectedUnitIndex === 0 && selectedContentIndex === 0;

  return (
    <div className={`course-detail-view ${isCinemaMode ? 'cinema-active' : ''}`}>
      {/* Top Breadcrumb & Action Bar */}
      <div className="detail-top-nav">
        <button className="btn btn-secondary btn-sm back-button" onClick={onBack} id="back-to-courses-btn">
          <IconArrowLeft size={16} />
          <span>Catalog</span>
        </button>

        <div className="detail-top-actions">
          <button
            className={`btn btn-sm ${isCinemaMode ? 'btn-emerald' : 'btn-outline'}`}
            onClick={() => setIsCinemaMode(!isCinemaMode)}
            title="Toggle Cinema Mode"
          >
            <IconVideo size={16} />
            <span>{isCinemaMode ? 'Exit Cinema' : 'Cinema Mode'}</span>
          </button>

          <button className="btn btn-outline btn-sm" onClick={() => onEditCourse(course)}>
            <IconEdit size={16} />
            <span>Edit Course</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => onOpenCreateUnit(course.courseId)}
            id="add-unit-top-btn"
          >
            <IconPlus size={16} />
            <span>Add Unit</span>
          </button>
        </div>
      </div>

      {/* Course Hero Banner */}
      {!isCinemaMode && (
        <div className="course-header-banner glass-card">
          <div className="course-header-grid">
            <div className="course-header-info">
              <div className="course-meta-tags">
                <span className="badge badge-primary">{course.category || 'Engineering'}</span>
                <span className="badge badge-amber">{course.courseLevel || 'All Levels'}</span>
                <span className="badge badge-emerald">{course.courseState || 'PUBLISHED'}</span>
              </div>

              <h1 className="course-header-title">{course.title}</h1>
              <p className="course-header-desc">{course.description}</p>

              <div className="course-metrics-row">
                <div className="metric-item">
                  <IconLayers size={18} className="metric-icon text-azure" />
                  <span><strong>{units.length}</strong> Modules</span>
                </div>
                <div className="metric-item">
                  <IconVideo size={18} className="metric-icon text-sky" />
                  <span><strong>{totalLessons}</strong> Lessons</span>
                </div>
                <div className="metric-item">
                  <IconClock size={18} className="metric-icon text-amber" />
                  <span><strong>~{Math.max(units.length * 45, 60)}</strong> Mins Total</span>
                </div>
                <div className="metric-item">
                  <span className="price-highlight">
                    ${course.price ? Number(course.price).toFixed(2) : 'Free'}
                  </span>
                </div>
              </div>

              {/* Course Progress Bar with Shimmer Animation */}
              <div className="progress-container">
                <div className="progress-header">
                  <span className="progress-label">Curriculum Mastery</span>
                  <span className="progress-percentage">
                    {progressPercent}% ({completedCount}/{totalLessons} completed)
                  </span>
                </div>
                <div className="shimmer-progress-bar">
                  <div className="shimmer-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>
            </div>

            <div className="course-header-thumbnail">
              <img
                src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'}
                alt={course.title}
                className="detail-thumbnail-img"
              />
              <div className="thumbnail-glow-overlay"></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Studio Layout (Units Playlist & Cinema Player) */}
      <div className="detail-studio-layout">
        {/* Left Column: Units & Lessons Curriculum Playlist */}
        <aside className="curriculum-sidebar glass-card">
          <div className="curriculum-header">
            <div className="curriculum-title-group">
              <IconBook size={20} className="text-azure" />
              <div>
                <h3>Curriculum Studio</h3>
                <span className="curriculum-stats-sub">{units.length} Units • {totalLessons} Lessons</span>
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onOpenCreateUnit(course.courseId)}
              title="Add a new unit to this course"
              id="sidebar-add-unit-btn"
            >
              <IconPlus size={16} />
              <span>Unit</span>
            </button>
          </div>

          <div className="units-playlist">
            {units.length === 0 ? (
              <div className="no-units-box">
                <IconLayers size={40} className="text-dim" />
                <h4>No units in this course yet</h4>
                <p>Start structuring your course by adding the first curriculum unit.</p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onOpenCreateUnit(course.courseId)}
                >
                  <IconPlus size={14} /> Add First Unit
                </button>
              </div>
            ) : (
              units.map((unit, uIdx) => {
                const unitKey = unit.unitId || `unit-${uIdx}`;
                const isExpanded = expandedUnitIds.has(unitKey);
                const isUnitActive = uIdx === selectedUnitIndex;
                const unitContents = unit.contents || [];

                return (
                  <div
                    key={unitKey}
                    className={`unit-accordion-group ${isExpanded ? 'expanded' : ''}`}
                  >
                    {/* Unit Accordion Header: Only unit shown by default */}
                    <div
                      className={`unit-group-header ${isUnitActive && isExpanded ? 'active-unit' : ''}`}
                      onClick={() => toggleUnitExpand(unitKey, uIdx)}
                    >
                      <div className="unit-header-left">
                        <span className="unit-badge-pill">Unit {unit.unitIndex || uIdx + 1}</span>
                        <h4 className="unit-header-title">{unit.title}</h4>
                      </div>
                      <div className="unit-header-right">
                        <span className="lesson-count-tag">{unitContents.length} Lessons</span>
                        <button
                          className="btn-unit-toggle"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleUnitExpand(unitKey, uIdx);
                          }}
                          title={isExpanded ? "Collapse unit contents (-)" : "Expand unit contents (+)"}
                          aria-label={isExpanded ? "Collapse unit contents" : "Expand unit contents"}
                        >
                          {isExpanded ? <IconMinus size={16} /> : <IconPlus size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Nested Contents / Lessons List: revealed when isExpanded is true */}
                    {isExpanded && (
                      <div className="nested-lessons-list">
                        {unitContents.length === 0 ? (
                          <div className="empty-unit-contents">
                            <p>No lessons uploaded yet for this unit.</p>
                            <button
                              className="btn btn-outline btn-sm btn-upload-first-lesson"
                              onClick={() => onOpenUploadContent(course.courseId, unit.unitId, unit.title, 1)}
                            >
                              <IconUpload size={14} />
                              <span>Upload First Lesson</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            {unitContents.map((content, cIdx) => {
                              const isContentActive = isUnitActive && cIdx === selectedContentIndex;
                              const isDone = completedContents.has(content.contentId || `${uIdx}-${cIdx}`);

                              return (
                                <div
                                  key={content.contentId || cIdx}
                                  className={`lesson-playlist-item ${isContentActive ? 'active-lesson' : ''} ${isDone ? 'completed-lesson' : ''}`}
                                  onClick={() => {
                                    setSelectedUnitIndex(uIdx);
                                    setSelectedContentIndex(cIdx);
                                  }}
                                >
                                  <div
                                    className={`lesson-checkbox ${isDone ? 'checked' : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleContentComplete(content.contentId || `${uIdx}-${cIdx}`);
                                    }}
                                    title={isDone ? "Mark as incomplete" : "Mark as completed"}
                                  >
                                    {isDone && <IconCheck size={12} />}
                                  </div>

                                  <div className="lesson-info">
                                    <div className="lesson-top-meta">
                                      <span className="lesson-num">Lesson {content.lessonIndex || cIdx + 1}</span>
                                      <span className="lesson-time">
                                        <IconClock size={12} />
                                        {formatDuration(content.duration)}
                                      </span>
                                    </div>
                                    <h5 className="lesson-title">{content.title}</h5>
                                  </div>

                                  {isContentActive && (
                                    <div className="sound-equalizer" title="Currently Playing">
                                      <span></span>
                                      <span></span>
                                      <span></span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            <button
                              className="btn btn-outline btn-sm btn-upload-first-lesson"
                              onClick={() => onOpenUploadContent(course.courseId, unit.unitId, unit.title, unitContents.length + 1)}
                              style={{ marginTop: '4px' }}
                            >
                              <IconUpload size={14} />
                              <span>Upload Lesson to Unit</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Column: Interactive Content Player & Lesson Studio */}
        <main className="content-viewer glass-card">
          {activeUnit ? (
            <div className="unit-viewer-inner">
              {/* Active Lesson Header & Controls */}
              <div className="unit-viewer-header">
                <div>
                  <div className="unit-number-badge">
                    Unit {activeUnit.unitIndex || selectedUnitIndex + 1} • {activeContent ? `Lesson ${activeContent.lessonIndex || selectedContentIndex + 1} of ${activeContents.length}` : 'Select Lesson'}
                  </div>
                  <h2 className="active-unit-title">
                    {activeContent ? activeContent.title : activeUnit.title}
                  </h2>
                </div>

                <div className="unit-nav-controls">
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={isFirstLesson}
                    onClick={handlePrevLesson}
                  >
                    <IconArrowLeft size={16} />
                    <span>Prev</span>
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={isLastLesson}
                    onClick={handleNextLesson}
                  >
                    <span>Next</span>
                    <IconArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Media Player Screen */}
              <div className="media-player-container">
                {activeContent && activeContent.contentUrl ? (
                  <video
                    key={activeContent.contentUrl}
                    controls
                    autoPlay={isPlaying}
                    className="lesson-video-element"
                    src={activeContent.contentUrl}
                    poster={course.thumbnailUrl}
                  />
                ) : (
                  <div className="player-simulation-screen">
                    <div className="simulation-graphic">
                      <div className="graphic-ring"></div>
                      <div className="graphic-pulse-waves"></div>
                      <button
                        className={`play-pulse-btn ${isPlaying ? 'playing' : ''}`}
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        <IconPlay size={32} />
                      </button>
                    </div>

                    <div className="simulation-info">
                      <div className="badge badge-sky simulation-badge">
                        <IconVideo size={14} />
                        <span>Interactive Lesson Console</span>
                      </div>
                      <h3>{activeContent ? activeContent.title : 'Ready to Stream'}</h3>
                      <p>
                        {activeContent?.description || activeUnit.description || 'Stream live video lessons, architectural demonstrations, and code walk-throughs.'}
                      </p>

                      {activeContent && (
                        <div className="resource-url-pill">
                          <IconClock size={14} />
                          <span>Duration: {formatDuration(activeContent.duration)}</span>
                          <span className="pill-divider">•</span>
                          <code>Content ID: {activeContent.contentId || 'local-preview'}</code>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Lesson Tabs & Deep Architecture Notes */}
              <div className="unit-body-section">
                <div className="section-tab-bar">
                  <button
                    className={`tab-item ${activeTab === 'notes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notes')}
                  >
                    <IconFileText size={16} />
                    <span>Lesson Synopsis</span>
                  </button>
                  <button
                    className={`tab-item ${activeTab === 'microservice' ? 'active' : ''}`}
                    onClick={() => setActiveTab('microservice')}
                  >
                    <IconSparkles size={16} />
                    <span>Microservice Persistence</span>
                  </button>
                </div>

                {activeTab === 'notes' ? (
                  <div className="tab-content-panel">
                    <div className="unit-description-box">
                      <h4>Lesson Overview</h4>
                      <p>
                        {activeContent?.description ||
                          activeUnit.description ||
                          'Comprehensive course lesson focusing on system architecture, service isolation, and declarative communication patterns.'}
                      </p>
                    </div>

                    <div className="lesson-quick-meta-grid">
                      <div className="meta-card">
                        <span className="meta-card-label">Parent Module</span>
                        <strong className="meta-card-value">{activeUnit.title}</strong>
                      </div>
                      <div className="meta-card">
                        <span className="meta-card-label">Playback Runtime</span>
                        <strong className="meta-card-value text-azure">
                          {formatDuration(activeContent?.duration || 420)}
                        </strong>
                      </div>
                      <div className="meta-card">
                        <span className="meta-card-label">Storage Bucket</span>
                        <strong className="meta-card-value text-emerald">content-files (MinIO)</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="tab-content-panel">
                    <div className="unit-insights-card">
                      <div className="insights-header">
                        <IconSparkles size={20} className="insights-icon text-azure" />
                        <h4>Hierarchical Aggregation Architecture</h4>
                      </div>
                      <p>
                        When opening this course, <strong>CourseService (:8082)</strong> dynamically called 
                        <strong>UnitService (:8084)</strong> via <code>UnitClient.getUnitsByCourseId()</code>. 
                        Then, for each unit, it invoked <strong>ContentService (:8083)</strong> via 
                        <code>ContentClient.getContentsByUnitId()</code> to seamlessly stitch this lesson tree together at runtime.
                      </p>
                      <div className="flow-code-preview">
                        <code>GET /api/v1/course/view/{course.courseId} &rarr; Course + Units[Contents]</code>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mark Completed & Next Actions */}
                <div className="unit-footer-actions">
                  {activeContent && (
                    <button
                      className={`btn ${completedContents.has(activeContent.contentId || `${selectedUnitIndex}-${selectedContentIndex}`) ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() =>
                        toggleContentComplete(activeContent.contentId || `${selectedUnitIndex}-${selectedContentIndex}`)
                      }
                    >
                      <IconCheckCircle size={18} />
                      <span>
                        {completedContents.has(activeContent.contentId || `${selectedUnitIndex}-${selectedContentIndex}`)
                          ? 'Completed (Click to undo)'
                          : 'Mark Lesson as Completed'}
                      </span>
                    </button>
                  )}

                  {!isLastLesson && (
                    <button className="btn btn-primary" onClick={handleNextLesson}>
                      <span>Continue to Next Lesson</span>
                      <IconArrowRight size={16} />
                    </button>
                  )}

                  <button
                    className="btn btn-outline"
                    onClick={() =>
                      onOpenUploadContent(course.courseId, activeUnit.unitId, activeUnit.title, activeContents.length + 1)
                    }
                  >
                    <IconUpload size={16} />
                    <span>Upload Another Lesson</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-unit-selected">
              <IconBook size={56} className="text-dim" />
              <h3>Select a Unit to Begin Learning</h3>
              <p>Choose any unit from the curriculum list on the left to start streaming lessons and videos.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
