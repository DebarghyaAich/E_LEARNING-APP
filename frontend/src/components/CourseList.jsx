import React, { useState, useMemo } from 'react';
import {
  IconBook,
  IconClock,
  IconDollar,
  IconEdit,
  IconFilter,
  IconLayers,
  IconPlay,
  IconSparkles,
  IconArrowRight,
  IconVideo,
  IconStar,
  IconGraduationCap
} from './Icons';

const CATEGORIES = [
  'All',
  'Cloud & Architecture',
  'Web Development',
  'AI & Data Science',
  'DevOps & SRE'
];

const LEVELS = ['All', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export default function CourseList({
  courses = [],
  onSelectCourse,
  onEditCourse,
  onOpenCreateCourse,
  searchTerm,
  setSearchTerm
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        !searchTerm ||
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || c.category === selectedCategory;

      const matchesLevel =
        selectedLevel === 'All' || c.courseLevel === selectedLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [courses, searchTerm, selectedCategory, selectedLevel]);

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 'BEGINNER':
        return 'badge-emerald';
      case 'INTERMEDIATE':
        return 'badge-primary';
      case 'ADVANCED':
        return 'badge-amber';
      default:
        return 'badge-primary';
    }
  };

  return (
    <div className="eduwerks-catalog-view">
      {/* Hero Welcome Banner (Eduwerks Style) */}
      <section className="eduwerks-hero-card">
        <div className="hero-left">
          <div className="hero-pill-badge">
            <IconSparkles size={15} className="text-primary" />
            <span>Eduwerks Engineering Academy</span>
          </div>

          <h1 className="hero-heading">
            Learn Production Systems With <br />
            <span className="text-primary-gradient">Hands-On Microservices</span>
          </h1>

          <p className="hero-description">
            Explore distributed architecture, OpenFeign communication, Eureka service discovery,
            MinIO media streaming, and real-time interaction forums.
          </p>

          <div className="hero-action-buttons">
            <button className="btn btn-primary" onClick={onOpenCreateCourse}>
              <span>Create New Course</span>
              <IconArrowRight size={16} />
            </button>
            <a href="#courses-grid" className="btn btn-secondary">
              <span>Browse Catalog</span>
            </a>
          </div>
        </div>

        <div className="hero-metrics-grid">
          <div className="metric-box">
            <span className="metric-number text-primary">{courses.length}</span>
            <span className="metric-label">Published Courses</span>
          </div>
          <div className="metric-box">
            <span className="metric-number text-emerald">5</span>
            <span className="metric-label">Microservices</span>
          </div>
          <div className="metric-box">
            <span className="metric-number text-amber">MinIO</span>
            <span className="metric-label">S3 Storage</span>
          </div>
          <div className="metric-box">
            <span className="metric-number text-sky">Eureka</span>
            <span className="metric-label">Discovery Active</span>
          </div>
        </div>
      </section>

      {/* Filter and Category Bar */}
      <div className="catalog-filters-bar" id="courses-grid">
        <div className="category-pills-list">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'All' ? 'All Tracks' : cat}
            </button>
          ))}
        </div>

        <div className="level-filter-select">
          <IconFilter size={15} className="filter-icon-muted" />
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="level-select-input"
          >
            {LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl === 'All' ? 'All Experience Levels' : `${lvl.charAt(0) + lvl.slice(1).toLowerCase()} Level`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="empty-catalog-state">
          <IconBook size={48} className="text-dim" />
          <h3>No Courses Found</h3>
          <p>Try adjusting your search query or filter tags to find available courses.</p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setSelectedLevel('All');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="courses-grid-layout">
          {filteredCourses.map((course) => {
            const unitCount = course.units?.length || 0;
            const lessonCount = course.units?.reduce(
              (acc, u) => acc + (u.contents?.length || 0),
              0
            ) || 0;

            return (
              <div
                key={course.courseId}
                className="eduwerks-course-card"
                onClick={() => onSelectCourse(course.courseId)}
              >
                {/* Card Thumbnail */}
                <div className="card-media-wrapper">
                  <img
                    src={
                      course.thumbnailUrl ||
                      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={course.title}
                    className="card-thumbnail-img"
                    loading="lazy"
                  />
                  <div className="card-media-overlay">
                    <span className="card-category-badge">{course.category || 'General'}</span>
                    <span className={`badge ${getLevelBadgeClass(course.courseLevel)}`}>
                      {course.courseLevel || 'BEGINNER'}
                    </span>
                  </div>
                  <button
                    className="card-quick-play-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCourse(course.courseId);
                    }}
                    title="Enter Classroom"
                  >
                    <IconPlay size={18} />
                  </button>
                </div>

                {/* Card Content Body */}
                <div className="card-content-body">
                  <div className="card-curriculum-meta">
                    <span className="meta-item">
                      <IconLayers size={14} />
                      <span>{unitCount} {unitCount === 1 ? 'Module' : 'Modules'}</span>
                    </span>
                    <span className="meta-bullet">•</span>
                    <span className="meta-item">
                      <IconVideo size={14} />
                      <span>{lessonCount} Lessons</span>
                    </span>
                    <span className="meta-bullet">•</span>
                    <span className="meta-rating">
                      <IconStar size={13} className="text-amber" />
                      <span>{course.rating || '4.9'}</span>
                    </span>
                  </div>

                  <h3 className="card-course-title">{course.title}</h3>
                  <p className="card-course-description">{course.description}</p>

                  {/* Instructor & Price Row */}
                  <div className="card-footer-row">
                    <div className="card-instructor-info">
                      <img
                        src={
                          course.instructorAvatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'
                        }
                        alt={course.instructorName || 'Instructor'}
                        className="instructor-avatar"
                      />
                      <div className="instructor-text">
                        <span className="instructor-name">
                          {course.instructorName || 'Prof. David Vance'}
                        </span>
                        <span className="instructor-title">
                          {course.instructorTitle || 'Staff Architect'}
                        </span>
                      </div>
                    </div>

                    <div className="card-price-tag">
                      {course.price && course.price > 0 ? (
                        <span className="price-amount">${course.price.toFixed(2)}</span>
                      ) : (
                        <span className="price-free">Free Access</span>
                      )}
                    </div>
                  </div>

                  {/* Card Action Row */}
                  <div className="card-action-bar">
                    <button
                      className="btn btn-primary btn-sm btn-full-width"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCourse(course.courseId);
                      }}
                    >
                      <span>Enter Studio</span>
                      <IconArrowRight size={14} />
                    </button>

                    <button
                      className="btn-card-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCourse(course);
                      }}
                      title="Edit Course Metadata"
                    >
                      <IconEdit size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
