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
  IconVideo
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

  // Filter courses based on search, category, and level
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
    <div className="course-list-view">
      {/* Hero Showcase Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge-pill">
            <span className="live-pulse-dot"></span>
            <IconSparkles size={15} />
            <span>Next-Gen Microservices E-Learning Cloud</span>
          </div>

          <h1 className="hero-title">
            Master Distributed Systems With <br />
            <span className="gradient-text">Interactive Lessons</span> & Media
          </h1>

          <p className="hero-subtitle">
            Curated curriculum powered by independent Spring Boot services: 
            <strong>Course Catalog</strong>, <strong>Unit Hierarchy</strong>, and <strong>Content Video Delivery</strong> backed by MinIO S3 & PostgreSQL.
          </p>

          <div className="hero-stats-row">
            <div className="hero-stat-card glass-card">
              <span className="hero-stat-value gradient-text-blue">{courses.length}</span>
              <span className="hero-stat-label">Active Courses</span>
            </div>

            <div className="hero-stat-card glass-card">
              <span className="hero-stat-value gradient-text">100%</span>
              <span className="hero-stat-label">Modular Curriculum</span>
            </div>

            <div className="hero-stat-card glass-card">
              <span className="hero-stat-value gradient-text-amber">MinIO S3</span>
              <span className="hero-stat-label">Media Object Storage</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Filters Bar */}
      <div className="filters-bar glass-card">
        {/* Category Pills */}
        <div className="filter-group">
          <span className="filter-group-label">
            <IconFilter size={15} /> Category:
          </span>
          <div className="pill-group">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Level Selector */}
        <div className="filter-group level-group">
          <span className="filter-group-label">Level:</span>
          <div className="pill-group">
            {LEVELS.map((lvl) => (
              <button
                key={lvl}
                className={`filter-pill ${selectedLevel === lvl ? 'active' : ''}`}
                onClick={() => setSelectedLevel(lvl)}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="results-header">
        <div className="results-title-group">
          <h2 className="results-title">
            Featured Courses <span className="results-count">({filteredCourses.length})</span>
          </h2>
          <span className="results-subtitle">Click on any course to open its units and stream lessons</span>
        </div>

        {(selectedCategory !== 'All' || selectedLevel !== 'All' || searchTerm) && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              setSelectedCategory('All');
              setSelectedLevel('All');
              setSearchTerm('');
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="course-grid">
          {filteredCourses.map((course, idx) => (
            <article
              key={course.courseId || idx}
              className="course-card glass-card glass-card-hover"
              onClick={() => onSelectCourse(course.courseId)}
              id={`course-card-${course.courseId || idx}`}
            >
              {/* Thumbnail Container */}
              <div className="card-thumb-container">
                <img
                  src={
                    course.thumbnailUrl ||
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={course.title}
                  className="card-thumb"
                  loading="lazy"
                />
                <div className="card-thumb-overlay">
                  <div className="thumb-play-circle">
                    <IconPlay size={22} />
                  </div>
                </div>

                <div className="card-badges-top">
                  <span className="badge badge-primary">{course.category || 'General'}</span>
                  <span className={`badge ${getLevelBadgeClass(course.courseLevel)}`}>
                    {course.courseLevel || 'ALL'}
                  </span>
                </div>

                <div className="card-price-tag">
                  ${course.price ? Number(course.price).toFixed(2) : 'Free'}
                </div>
              </div>

              {/* Card Body */}
              <div className="card-body">
                <h3 className="card-title" title={course.title}>
                  {course.title}
                </h3>
                <p className="card-desc">
                  {course.description || 'Comprehensive modular course covering fundamental and advanced architecture concepts.'}
                </p>

                {/* Card Footer */}
                <div className="card-footer">
                  <div className="card-meta">
                    <span className="meta-item">
                      <IconLayers size={15} className="text-azure" />
                      <span>{course.units ? `${course.units.length} Modules` : 'Modular Units'}</span>
                    </span>
                  </div>

                  <div className="card-actions-row">
                    <button
                      className="btn-icon-action"
                      title="Edit Course Metadata"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCourse(course);
                      }}
                    >
                      <IconEdit size={16} />
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCourse(course.courseId);
                      }}
                    >
                      <span>Explore</span>
                      <IconArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state glass-card">
          <IconBook size={56} className="empty-icon text-azure" />
          <h3>No matching courses found</h3>
          <p>We couldn't find any courses matching your current search or category filters.</p>
          <div className="empty-actions">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSelectedCategory('All');
                setSelectedLevel('All');
                setSearchTerm('');
              }}
            >
              Clear Filters
            </button>
            <button className="btn btn-primary" onClick={onOpenCreateCourse}>
              <IconSparkles size={16} />
              <span>Create First Course</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
