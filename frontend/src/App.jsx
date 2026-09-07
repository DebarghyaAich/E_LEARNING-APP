import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import CourseList from './components/CourseList';
import CourseDetail from './components/CourseDetail';
import CreateCourseModal from './components/CreateCourseModal';
import CreateUnitModal from './components/CreateUnitModal';
import EditCourseModal from './components/EditCourseModal';
import UploadContentModal from './components/UploadContentModal';
import {
  fetchAllCourses,
  enterIntoCourse,
  createCourse,
  updateCourse,
  createUnit,
  uploadContent,
  checkBackendHealth
} from './services/api';

export default function App() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedCourseData, setSelectedCourseData] = useState({ course: null, units: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveServer, setIsLiveServer] = useState(false);

  // Modals
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isCreateUnitOpen, setIsCreateUnitOpen] = useState(false);
  const [targetCourseIdForUnit, setTargetCourseIdForUnit] = useState(null);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);

  // Content Upload Modal State
  const [isUploadContentOpen, setIsUploadContentOpen] = useState(false);
  const [uploadTargetCourseId, setUploadTargetCourseId] = useState(null);
  const [uploadTargetUnitId, setUploadTargetUnitId] = useState(null);
  const [uploadTargetUnitTitle, setUploadTargetUnitTitle] = useState('');
  const [uploadTargetNextIndex, setUploadTargetNextIndex] = useState(1);

  // Notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Load all courses
  const loadCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      const isHealthy = await checkBackendHealth();
      setIsLiveServer(isHealthy);

      const result = await fetchAllCourses();
      setCourses(result.data);
    } catch (err) {
      console.error('Failed to load courses:', err);
      addToast('Failed to load courses', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Enter into course (CourseService -> UnitClient -> ContentClient)
  const handleSelectCourse = async (courseId) => {
    try {
      setIsLoading(true);
      const data = await enterIntoCourse(courseId);
      setSelectedCourseId(courseId);
      setSelectedCourseData({
        course: data.course,
        units: data.units || []
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to enter course:', err);
      addToast('Error entering course', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Back to catalog
  const handleGoHome = () => {
    setSelectedCourseId(null);
    setSelectedCourseData({ course: null, units: [] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Create Course handler
  const handleCreateCourseSubmit = async (formDataPayload) => {
    const result = await createCourse(formDataPayload);
    if (result.success) {
      addToast(
        result.isLive
          ? 'Course created in PostgreSQL via CourseService (8082)!'
          : 'Course created in Interactive Demo Database!'
      );
      await loadCourses();
      if (result.data?.courseId) {
        handleSelectCourse(result.data.courseId);
      }
    }
  };

  // Update Course handler
  const handleUpdateCourseSubmit = async (courseId, formDataPayload) => {
    const result = await updateCourse(courseId, formDataPayload);
    if (result.success) {
      addToast('Course metadata updated successfully!');
      await loadCourses();
      if (selectedCourseId === courseId) {
        handleSelectCourse(courseId);
      }
    }
  };

  // Open Add Unit Modal
  const handleOpenCreateUnit = (courseId) => {
    setTargetCourseIdForUnit(courseId || selectedCourseId);
    setIsCreateUnitOpen(true);
  };

  // Create Unit handler
  const handleCreateUnitSubmit = async (courseId, unitPayload) => {
    const result = await createUnit(courseId, unitPayload);
    if (result.success) {
      addToast(
        result.isLive
          ? 'Unit added in PostgreSQL via UnitService (8084)!'
          : 'Unit added to course curriculum!'
      );
      if (selectedCourseId === courseId) {
        const details = await enterIntoCourse(courseId);
        setSelectedCourseData({
          course: details.course,
          units: details.units || []
        });
      }
    }
  };

  // Open Upload Content Modal
  const handleOpenUploadContent = (courseId, unitId, unitTitle, nextIndex = 1) => {
    setUploadTargetCourseId(courseId || selectedCourseId);
    setUploadTargetUnitId(unitId);
    setUploadTargetUnitTitle(unitTitle || '');
    setUploadTargetNextIndex(nextIndex);
    setIsUploadContentOpen(true);
  };

  // Upload Content handler
  const handleUploadContentSubmit = async (courseId, unitId, formData) => {
    const result = await uploadContent(courseId, unitId, formData);
    if (result.success) {
      addToast(
        result.isLive
          ? 'Lesson uploaded & streamed to MinIO via ContentService (8083)!'
          : 'Lesson content added to module playlist!'
      );
      // Refresh active course hierarchy
      if (selectedCourseId === courseId) {
        const details = await enterIntoCourse(courseId);
        setSelectedCourseData({
          course: details.course,
          units: details.units || []
        });
      }
    }
  };

  // Open Edit Course Modal
  const handleOpenEditCourse = (course) => {
    setCourseToEdit(course);
    setIsEditCourseOpen(true);
  };

  return (
    <div className="app-container">
      {/* Dynamic Animated Ambient Background Aura */}
      <div className="ambient-orb ambient-orb-top"></div>
      <div className="ambient-orb ambient-orb-bottom"></div>

      {/* Navbar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenCreateCourse={() => setIsCreateCourseOpen(true)}
        onGoHome={handleGoHome}
        isLiveServer={isLiveServer}
        activeView={selectedCourseId ? 'detail' : 'catalog'}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {isLoading && (
          <div className="loading-bar-wrapper">
            <div className="loading-bar-fill"></div>
          </div>
        )}

        {selectedCourseId && selectedCourseData.course ? (
          <CourseDetail
            course={selectedCourseData.course}
            units={selectedCourseData.units}
            onBack={handleGoHome}
            onOpenCreateUnit={handleOpenCreateUnit}
            onOpenUploadContent={handleOpenUploadContent}
            onEditCourse={handleOpenEditCourse}
          />
        ) : (
          <CourseList
            courses={courses}
            onSelectCourse={handleSelectCourse}
            onEditCourse={handleOpenEditCourse}
            onOpenCreateCourse={() => setIsCreateCourseOpen(true)}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}
      </main>

      {/* Modals */}
      <CreateCourseModal
        isOpen={isCreateCourseOpen}
        onClose={() => setIsCreateCourseOpen(false)}
        onSubmit={handleCreateCourseSubmit}
      />

      <CreateUnitModal
        isOpen={isCreateUnitOpen}
        onClose={() => setIsCreateUnitOpen(false)}
        onSubmit={handleCreateUnitSubmit}
        courseId={targetCourseIdForUnit}
        nextIndex={(selectedCourseData.units?.length || 0) + 1}
      />

      <UploadContentModal
        isOpen={isUploadContentOpen}
        onClose={() => setIsUploadContentOpen(false)}
        onSubmit={handleUploadContentSubmit}
        courseId={uploadTargetCourseId}
        unitId={uploadTargetUnitId}
        unitTitle={uploadTargetUnitTitle}
        nextLessonIndex={uploadTargetNextIndex}
      />

      <EditCourseModal
        isOpen={isEditCourseOpen}
        onClose={() => {
          setIsEditCourseOpen(false);
          setCourseToEdit(null);
        }}
        onSubmit={handleUpdateCourseSubmit}
        course={courseToEdit}
      />

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span className="toast-dot"></span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
