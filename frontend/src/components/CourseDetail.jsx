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
  IconDollar,
  IconMessageSquare,
  IconPenTool,
  IconServer
} from './Icons';
import CommentSection from './CommentSection';
import Whiteboard from './Whiteboard';

export default function CourseDetail({
  course,
  units = [],
  onBack,
  onOpenCreateUnit,
  onOpenUploadContent,
  onEditCourse,
  addToast
}) {
  // Active Unit & Lesson Indices
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
  const [selectedContentIndex, setSelectedContentIndex] = useState(0);
  // Default expand the first unit so the user immediately sees the first lesson
  const [expandedUnitIds, setExpandedUnitIds] = useState(() => {
    const firstKey = units[0]?.unitId || 'unit-0';
    return new Set([firstKey]);
  });
  const [completedContents, setCompletedContents] = useState(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'discussion' | 'whiteboard' | 'microservices'

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

  // Navigate to Next Lesson
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

  return (
    <div className={`eduwerks-classroom-view ${isCinemaMode ? 'cinema-expanded' : ''}`}>
      {/* Course Studio Header */}
      <div className="classroom-top-banner">
        <div className="banner-left-group">
          <button className="btn-back-link" onClick={onBack}>
            <IconArrowLeft size={16} />
            <span>Catalog</span>
          </button>
          <span className="banner-divider">/</span>
          <span className="banner-category-pill">{course.category || 'Cloud Engineering'}</span>
          <span className="banner-divider">/</span>
          <h2 className="banner-course-title">{course.title}</h2>
        </div>

        <div className="banner-right-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onEditCourse(course)}
            title="Edit Course Metadata"
          >
            <IconEdit size={14} />
            <span>Edit Course</span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsCinemaMode(!isCinemaMode)}
            title="Toggle Cinema / Focus Mode"
          >
            <IconLayers size={14} />
            <span>{isCinemaMode ? 'Standard Layout' : 'Focus Cinema'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio 2-Column Layout */}
      <div className="classroom-grid-container">
        {/* LEFT / CENTER COLUMN: Main Lesson Player & Interactive Tabs */}
        <main className="classroom-player-column">
          {activeUnit ? (
            <div className="player-stage-card">
              {/* Lesson Controls Top Bar */}
              <div className="stage-top-controls">
                <div className="stage-lesson-info">
                  <span className="stage-lesson-pill">
                    Unit {activeUnit.unitIndex || selectedUnitIndex + 1} • Lesson {activeContent?.lessonIndex || selectedContentIndex + 1}
                  </span>
                  <h3 className="stage-lesson-heading">
                    {activeContent ? activeContent.title : activeUnit.title}
                  </h3>
                </div>

                <div className="stage-nav-buttons">
                  <button
                    className="btn btn-secondary btn-xs"
                    onClick={handlePrevLesson}
                    disabled={selectedUnitIndex === 0 && selectedContentIndex === 0}
                    title="Previous Lesson"
                  >
                    <IconArrowLeft size={14} />
                    <span>Prev</span>
                  </button>

                  <button
                    className="btn btn-secondary btn-xs"
                    onClick={handleNextLesson}
                    disabled={isLastLesson}
                    title="Next Lesson"
                  >
                    <span>Next</span>
                    <IconArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Video Player Display */}
              <div className="eduwerks-video-container">
                {activeContent && activeContent.contentUrl ? (
                  <video
                    key={activeContent.contentUrl}
                    controls
                    autoPlay={isPlaying}
                    className="eduwerks-html5-video"
                    src={activeContent.contentUrl}
                    poster={course.thumbnailUrl}
                  />
                ) : (
                  <div className="eduwerks-player-simulation">
                    <div className="sim-center-graphic">
                      <div className="sim-pulse-wave"></div>
                      <button
                        className={`sim-play-pulse ${isPlaying ? 'sim-active' : ''}`}
                        onClick={() => setIsPlaying(!isPlaying)}
                        title={isPlaying ? 'Pause simulation' : 'Play video lesson'}
                      >
                        <IconPlay size={32} />
                      </button>
                    </div>

                    <div className="sim-overlay-details">
                      <div className="badge badge-sky sim-badge-pill">
                        <IconVideo size={13} />
                        <span>High-Definition Media Player</span>
                      </div>
                      <h4>{activeContent ? activeContent.title : 'Ready to Stream'}</h4>
                      <p>
                        {activeContent?.description || activeUnit.description || 'Stream live video lessons, architectural demonstrations, and code walk-throughs.'}
                      </p>

                      {activeContent && (
                        <div className="sim-duration-pill">
                          <IconClock size={13} />
                          <span>Duration: {formatDuration(activeContent.duration)}</span>
                          <span className="pill-dot">•</span>
                          <code>Content ID: {activeContent.contentId || 'preview-stream'}</code>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Tabs Bar (Eduwerks Style) */}
              <div className="classroom-tab-nav">
                <button
                  className={`classroom-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notes')}
                >
                  <IconFileText size={16} />
                  <span>Lesson Overview</span>
                </button>

                <button
                  className={`classroom-tab-btn ${activeTab === 'discussion' ? 'active' : ''}`}
                  onClick={() => setActiveTab('discussion')}
                >
                  <IconMessageSquare size={16} />
                  <span>Discussion & Q&A</span>
                </button>

                <button
                  className={`classroom-tab-btn ${activeTab === 'whiteboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('whiteboard')}
                >
                  <IconPenTool size={16} />
                  <span>Interactive Whiteboard</span>
                </button>

                <button
                  className={`classroom-tab-btn ${activeTab === 'microservices' ? 'active' : ''}`}
                  onClick={() => setActiveTab('microservices')}
                >
                  <IconServer size={16} />
                  <span>Microservices Flow</span>
                </button>
              </div>

              {/* Tab Panel Content */}
              <div className="classroom-tab-panel">
                {/* TAB 1: OVERVIEW */}
                {activeTab === 'notes' && (
                  <div className="tab-pane-overview">
                    <div className="overview-text-card">
                      <h4>Lesson Synopsis</h4>
                      <p>
                        {activeContent?.description ||
                          activeUnit.description ||
                          'Comprehensive course lesson focusing on system architecture, service isolation, and declarative communication patterns.'}
                      </p>
                    </div>

                    <div className="overview-metrics-row">
                      <div className="overview-metric-card">
                        <span className="metric-label">Parent Module</span>
                        <strong className="metric-value">{activeUnit.title}</strong>
                      </div>
                      <div className="overview-metric-card">
                        <span className="metric-label">Runtime Duration</span>
                        <strong className="metric-value text-primary">
                          {formatDuration(activeContent?.duration || 480)}
                        </strong>
                      </div>
                      <div className="overview-metric-card">
                        <span className="metric-label">Storage Provider</span>
                        <strong className="metric-value text-emerald">MinIO S3 / PostgreSQL</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: DISCUSSION & COMMENTS (InteractionService) */}
                {activeTab === 'discussion' && (
                  <div className="tab-pane-discussion">
                    <CommentSection
                      contentId={activeContent?.contentId || 'cnt-101'}
                      lessonTitle={activeContent?.title || activeUnit?.title}
                      addToast={addToast}
                    />
                  </div>
                )}

                {/* TAB 3: WHITEBOARD / NOTES (Eduwerks Case Study) */}
                {activeTab === 'whiteboard' && (
                  <div className="tab-pane-whiteboard">
                    <Whiteboard lessonTitle={activeContent?.title || activeUnit?.title} />
                  </div>
                )}

                {/* TAB 4: MICROSERVICES TELEMETRY */}
                {activeTab === 'microservices' && (
                  <div className="tab-pane-telemetry">
                    <div className="telemetry-info-card">
                      <div className="telemetry-title-group">
                        <IconSparkles size={18} className="text-primary" />
                        <h4>Hierarchical Aggregation Architecture</h4>
                      </div>
                      <p>
                        When opening this course, <strong>CourseService (:8082)</strong> dynamically queried
                        <strong>UnitService (:8084)</strong> via <code>UnitClient.getUnitsByCourseId()</code>.
                        Then, for each unit, it invoked <strong>ContentService (:8083)</strong> via
                        <code>ContentClient.getContentsByUnitId()</code> to assemble this course hierarchy at runtime.
                      </p>
                      <div className="telemetry-code-pill">
                        <code>GET /api/v1/course/view/{course.courseId} &rarr; Course + Units[Contents]</code>
                      </div>
                    </div>
                  </div>
                )}

                {/* Classroom Bottom Actions */}
                <div className="classroom-footer-actions">
                  {activeContent && (
                    <button
                      className={`btn ${
                        completedContents.has(
                          activeContent.contentId || `${selectedUnitIndex}-${selectedContentIndex}`
                        )
                          ? 'btn-secondary'
                          : 'btn-primary'
                      }`}
                      onClick={() =>
                        toggleContentComplete(
                          activeContent.contentId || `${selectedUnitIndex}-${selectedContentIndex}`
                        )
                      }
                    >
                      <IconCheckCircle size={17} />
                      <span>
                        {completedContents.has(
                          activeContent.contentId || `${selectedUnitIndex}-${selectedContentIndex}`
                        )
                          ? 'Completed (Undo)'
                          : 'Mark Lesson Completed'}
                      </span>
                    </button>
                  )}

                  {!isLastLesson && (
                    <button className="btn btn-primary" onClick={handleNextLesson}>
                      <span>Continue Next</span>
                      <IconArrowRight size={15} />
                    </button>
                  )}

                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      onOpenUploadContent(
                        course.courseId,
                        activeUnit.unitId,
                        activeUnit.title,
                        activeContents.length + 1
                      )
                    }
                  >
                    <IconUpload size={15} />
                    <span>Upload Lesson (:8083)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-active-unit-state">
              <IconBook size={56} className="text-dim" />
              <h3>No Unit Selected</h3>
              <p>Select a module from the curriculum sidebar on the right to start learning.</p>
            </div>
          )}
        </main>

        {/* RIGHT COLUMN: Curriculum Sidebar with + / - Toggle */}
        <aside className="classroom-sidebar-column">
          <div className="curriculum-panel-card">
            {/* Curriculum Header */}
            <div className="curriculum-top-bar">
              <div className="curriculum-headings">
                <h3>Curriculum Studio</h3>
                <span className="curriculum-counts">
                  {units.length} Modules • {totalLessons} Lessons
                </span>
              </div>

              <button
                className="btn btn-primary btn-xs"
                onClick={() => onOpenCreateUnit(course.courseId)}
                title="Add a new unit to this course via UnitService (:8084)"
                id="sidebar-add-unit-btn"
              >
                <IconPlus size={14} />
                <span>Add Unit</span>
              </button>
            </div>

            {/* Course Progress Meter */}
            <div className="course-progress-box">
              <div className="progress-labels">
                <span className="progress-text">Course Completion</span>
                <span className="progress-percent-val">{progressPercent}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>

            {/* Units List */}
            <div className="curriculum-units-stack">
              {units.length === 0 ? (
                <div className="curriculum-empty-box">
                  <IconLayers size={36} className="text-dim" />
                  <h4>No Units Created Yet</h4>
                  <p>Structure your curriculum by adding your first unit.</p>
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
                      className={`curriculum-unit-card ${isExpanded ? 'is-expanded' : ''} ${
                        isUnitActive ? 'is-active-unit' : ''
                      }`}
                    >
                      {/* Unit Header: ONLY Unit shown by default + Right hand side +/- button */}
                      <div
                        className="unit-card-header"
                        onClick={() => toggleUnitExpand(unitKey, uIdx)}
                      >
                        <div className="unit-card-title-left">
                          <span className="unit-index-pill">
                            Unit {unit.unitIndex || uIdx + 1}
                          </span>
                          <h4 className="unit-name-text">{unit.title}</h4>
                        </div>

                        <div className="unit-card-toggle-right">
                          <span className="unit-lessons-pill">
                            {unitContents.length} {unitContents.length === 1 ? 'Lesson' : 'Lessons'}
                          </span>

                          {/* Plus (+) / Minus (-) button */}
                          <button
                            className={`btn-unit-plus-minus ${isExpanded ? 'expanded' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleUnitExpand(unitKey, uIdx);
                            }}
                            title={isExpanded ? 'Collapse lessons (-)' : 'Expand lessons (+)'}
                            aria-label={isExpanded ? 'Collapse unit' : 'Expand unit'}
                          >
                            {isExpanded ? <IconMinus size={16} /> : <IconPlus size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Nested Contents / Lessons List: Visible ONLY when expanded */}
                      {isExpanded && (
                        <div className="unit-lessons-drawer">
                          {unitContents.length === 0 ? (
                            <div className="empty-lessons-drawer">
                              <p>No lessons uploaded yet in this unit.</p>
                              <button
                                className="btn btn-secondary btn-xs"
                                onClick={() =>
                                  onOpenUploadContent(course.courseId, unit.unitId, unit.title, 1)
                                }
                              >
                                <IconUpload size={13} />
                                <span>Upload First Lesson</span>
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="lessons-items-list">
                                {unitContents.map((content, cIdx) => {
                                  const isContentActive =
                                    isUnitActive && cIdx === selectedContentIndex;
                                  const isDone = completedContents.has(
                                    content.contentId || `${uIdx}-${cIdx}`
                                  );

                                  return (
                                    <div
                                      key={content.contentId || cIdx}
                                      className={`lesson-row-item ${
                                        isContentActive ? 'active' : ''
                                      } ${isDone ? 'completed' : ''}`}
                                      onClick={() => {
                                        setSelectedUnitIndex(uIdx);
                                        setSelectedContentIndex(cIdx);
                                      }}
                                    >
                                      {/* Completion check icon */}
                                      <button
                                        className={`lesson-check-circle ${isDone ? 'checked' : ''}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleContentComplete(
                                            content.contentId || `${uIdx}-${cIdx}`
                                          );
                                        }}
                                        title={isDone ? 'Mark uncompleted' : 'Mark completed'}
                                      >
                                        {isDone ? <IconCheck size={12} /> : null}
                                      </button>

                                      <div className="lesson-row-info">
                                        <span className="lesson-row-title">
                                          {cIdx + 1}. {content.title}
                                        </span>
                                        <div className="lesson-row-meta">
                                          <IconClock size={12} />
                                          <span>{formatDuration(content.duration)}</span>
                                        </div>
                                      </div>

                                      <div className="lesson-row-trailing">
                                        {isContentActive ? (
                                          <span className="now-playing-pill">Playing</span>
                                        ) : (
                                          <IconPlay size={13} className="play-icon-dim" />
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Upload another lesson button at bottom of expanded unit */}
                              <button
                                className="btn-add-lesson-row"
                                onClick={() =>
                                  onOpenUploadContent(
                                    course.courseId,
                                    unit.unitId,
                                    unit.title,
                                    unitContents.length + 1
                                  )
                                }
                              >
                                <IconUpload size={13} />
                                <span>+ Upload Lesson to Unit {unit.unitIndex || uIdx + 1}</span>
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
          </div>
        </aside>
      </div>
    </div>
  );
}
