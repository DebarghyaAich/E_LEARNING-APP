import React from 'react';
import { IconBook, IconPlus, IconSearch, IconServer, IconSparkles } from './Icons';

export default function Navbar({
  searchTerm,
  setSearchTerm,
  onOpenCreateCourse,
  onGoHome,
  isLiveServer,
  activeView
}) {
  return (
    <header className="navbar-wrapper">
      <div className="navbar-inner">
        {/* Brand & Logo */}
        <div className="navbar-brand" onClick={onGoHome} role="button" tabIndex={0} id="nav-brand-btn">
          <div className="brand-icon-box">
            <IconSparkles size={22} className="brand-icon-sparkle" />
          </div>
          <div className="brand-text-group">
            <div className="brand-title">
              Edu<span className="brand-accent">Flow</span>
            </div>
            <span className="brand-tagline">Cloud Microservices Studio</span>
          </div>
        </div>

        {/* Global Search */}
        <div className="nav-search-container">
          <IconSearch size={18} className="search-icon" />
          <input
            type="text"
            id="global-search-input"
            className="nav-search-input"
            placeholder="Search courses, lessons, tech stack... (e.g. Eureka, MinIO, Feign)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="search-clear-btn" onClick={() => setSearchTerm('')} type="button">
              ×
            </button>
          )}
        </div>

        {/* Actions & Health Badge */}
        <div className="navbar-actions">
          {/* Microservices Health Status */}
          <div
            className={`service-status-pill ${isLiveServer ? 'status-live' : 'status-demo'}`}
            title={
              isLiveServer
                ? 'Connected to Spring Boot CourseService (:8082), UnitService (:8084) & ContentService (:8083)'
                : 'Backend starting up: Running interactive local simulation'
            }
          >
            <span className={`status-dot ${isLiveServer ? 'pulse' : ''}`}></span>
            <IconServer size={14} />
            <span className="status-label">
              {isLiveServer ? 'Live Microservices' : 'Demo DB Mode'}
            </span>
          </div>

          {activeView !== 'catalog' && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={onGoHome}
              id="nav-catalog-btn"
            >
              Browse Catalog
            </button>
          )}

          <button
            className="btn btn-primary"
            onClick={onOpenCreateCourse}
            id="nav-create-course-btn"
          >
            <IconPlus size={18} />
            <span>New Course</span>
          </button>
        </div>
      </div>
    </header>
  );
}
