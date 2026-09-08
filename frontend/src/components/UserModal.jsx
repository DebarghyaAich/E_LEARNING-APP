import React, { useState } from 'react';
import { IconX, IconUser, IconCheck, IconSparkles } from './Icons';
import { registerUser, getActiveUser, setActiveUser } from '../services/api';

export default function UserModal({ isOpen, onClose, onUserChanged, addToast }) {
  const currentUser = getActiveUser();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'register' | 'switch'
  const [isLoading, setIsLoading] = useState(false);

  // Registration form
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }
    if (formData.password.length < 6) {
      addToast('Password must be at least 6 characters.', 'error');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const res = await registerUser(formData);
      if (res.success) {
        addToast(
          res.isLive
            ? `User registered in PostgreSQL via UserService (:8081)!`
            : `User created in Eduwerks session!`
        );
        onUserChanged(res.data);
        onClose();
      }
    } catch (err) {
      addToast(`Registration error: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSwitch = (role, name, email) => {
    const [firstName, lastName] = name.split(' ');
    const updated = {
      userId: role === 'INSTRUCTOR' ? '201' : '101',
      firstName,
      lastName: lastName || '',
      email,
      role,
      avatarUrl: role === 'INSTRUCTOR'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80'
    };
    setActiveUser(updated);
    onUserChanged(updated);
    addToast(`Switched active role to ${role} (${name})`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container user-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <IconUser size={20} className="text-primary" />
            </div>
            <div>
              <h3>Eduwerks User Identity</h3>
              <p className="modal-subtitle">Connected to UserService on port 8081</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <IconX size={20} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="modal-tab-bar">
          <button
            className={`modal-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Active Profile
          </button>
          <button
            className={`modal-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Register New User
          </button>
          <button
            className={`modal-tab ${activeTab === 'switch' ? 'active' : ''}`}
            onClick={() => setActiveTab('switch')}
          >
            Switch Persona
          </button>
        </div>

        {/* Tab 1: Active Profile */}
        {activeTab === 'profile' && (
          <div className="user-profile-view">
            <div className="user-avatar-showcase">
              <img src={currentUser.avatarUrl} alt={currentUser.firstName} className="profile-large-avatar" />
              <div className="profile-badge-pill">
                <IconSparkles size={13} />
                <span>{currentUser.role}</span>
              </div>
            </div>

            <div className="user-details-list">
              <div className="user-detail-row">
                <span className="detail-label">Full Name:</span>
                <strong className="detail-value">{currentUser.firstName} {currentUser.lastName}</strong>
              </div>
              <div className="user-detail-row">
                <span className="detail-label">Email Address:</span>
                <span className="detail-value">{currentUser.email}</span>
              </div>
              <div className="user-detail-row">
                <span className="detail-label">User ID (DB):</span>
                <code className="detail-code">#{currentUser.userId}</code>
              </div>
              <div className="user-detail-row">
                <span className="detail-label">Service Source:</span>
                <span className="detail-value text-emerald">UserService (:8081) / Eureka</span>
              </div>
            </div>

            <div className="modal-actions-bar">
              <button className="btn btn-secondary" onClick={() => setActiveTab('switch')}>
                Switch Persona
              </button>
              <button className="btn btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Register New User */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="user-register-form">
            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lin"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                required
                placeholder="maya.lin@eduwerks.io"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">Password * (min 6)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="modal-actions-bar">
              <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('profile')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Create Account (:8081)'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Switch Persona */}
        {activeTab === 'switch' && (
          <div className="user-switch-personas">
            <p className="persona-subtext">Select a preconfigured persona to test student and instructor roles:</p>
            <div className="persona-card" onClick={() => handleQuickSwitch('STUDENT', 'Elena Rostova', 'elena.rostova@eduwerks.io')}>
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80" alt="Elena" className="persona-avatar" />
              <div className="persona-info">
                <h4>Elena Rostova <span className="badge badge-emerald">Active Student</span></h4>
                <p>Enrolled in Cloud Architecture & Full-Stack React courses.</p>
              </div>
            </div>

            <div className="persona-card" onClick={() => handleQuickSwitch('INSTRUCTOR', 'Prof. David Vance', 'david.vance@eduwerks.io')}>
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80" alt="David" className="persona-avatar" />
              <div className="persona-info">
                <h4>Prof. David Vance <span className="badge badge-sky">Lead Instructor</span></h4>
                <p>Course author with permissions to create units and upload lessons.</p>
              </div>
            </div>

            <div className="persona-card" onClick={() => handleQuickSwitch('ADMIN', 'Alex Thorne', 'alex.thorne@eduwerks.io')}>
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80" alt="Alex" className="persona-avatar" />
              <div className="persona-info">
                <h4>Alex Thorne <span className="badge badge-amber">Platform Admin</span></h4>
                <p>Full administrative access across microservices registry and content.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
