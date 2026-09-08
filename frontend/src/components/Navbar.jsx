import React from 'react';
import {
  IconGraduationCap,
  IconPlus,
  IconSearch,
  IconServer,
  IconUser,
  IconSparkles
} from './Icons';

export default function Navbar({
  searchTerm,
  setSearchTerm,
  onOpenCreateCourse,
  onGoHome,
  onOpenUserModal,
  currentUser,
  servicesHealth,
  activeView
}) {
  const isAnyLive = servicesHealth?.isAnyLive ?? false;

  return (
    <header className="eduwerks-navbar">
      <div className="navbar-container">
        {/* Brand & Logo */}
        <div className="navbar-brand-section" onClick={onGoHome} role="button" tabIndex={0} id="nav-brand-btn">
          <div className="brand-logo-gem">
            <IconGraduationCap size={24} className="brand-logo-icon" />
          </div>
          <div className="brand-titles">
            <span className="brand-name">Edu<span className="brand-name-accent">werks</span></span>
            <span className="brand-tag">Cloud Microservices EdTech</span>
          </div>
        </div>

        {/* Global Search Pill */}
        <div className="navbar-search-wrapper">
          <IconSearch size={17} className="search-icon-muted" />
          <input
            type="text"
            id="global-search-input"
            className="navbar-search-field"
            placeholder="Search microservices courses, lessons, topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm ? (
            <button className="search-clear-btn" onClick={() => setSearchTerm('')} type="button">
              ×
            </button>
          ) : (
            <span className="search-shortcut-badge">⌘K</span>
          )}
        </div>

        {/* Action Controls & Health */}
        <div className="navbar-right-controls">
          {/* Microservices Health Indicator */}
          <div
            className={`services-health-pill ${isAnyLive ? 'health-live' : 'health-demo'}`}
            title={`Services Status: Course (8082): ${servicesHealth?.course ? 'UP' : 'STANDBY'}, Unit (8084): ${servicesHealth?.unit ? 'UP' : 'STANDBY'}, Content (8083): ${servicesHealth?.content ? 'UP' : 'STANDBY'}, User (8081): ${servicesHealth?.user ? 'UP' : 'STANDBY'}, Interaction (8085): ${servicesHealth?.interaction ? 'UP' : 'STANDBY'}`}
          >
            <span className={`live-pulse-dot ${isAnyLive ? 'pulsing' : ''}`}></span>
            <IconServer size={14} />
            <span className="health-label">
              {isAnyLive ? '5 Microservices Active' : 'Demo DB Mode'}
            </span>
          </div>

          {/* Catalog Home Button when on Course Detail */}
          {activeView !== 'catalog' && (
            <button
              className="btn btn-secondary btn-sm nav-back-catalog-btn"
              onClick={onGoHome}
              id="nav-catalog-btn"
            >
              Explore Catalog
            </button>
          )}

          {/* New Course Action */}
          <button
            className="btn btn-primary btn-sm"
            onClick={onOpenCreateCourse}
            id="nav-create-course-btn"
          >
            <IconPlus size={16} />
            <span>New Course</span>
          </button>

          {/* Active User Avatar Pill */}
          <div
            className="nav-user-profile-pill"
            onClick={onOpenUserModal}
            role="button"
            tabIndex={0}
            title="Manage User Profile & Identity (UserService :8081)"
          >
            <img
              src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80'}
              alt={currentUser?.firstName || 'User'}
              className="nav-user-avatar"
            />
            <div className="nav-user-info">
              <span className="nav-user-name">{currentUser?.firstName || 'Guest'}</span>
              <span className="nav-user-role-badge">{currentUser?.role || 'STUDENT'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
