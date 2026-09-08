/**
 * Eduwerks Frontend API Service
 * Centralized client for:
 * - CourseService (:8082)
 * - UnitService (:8084)
 * - ContentService (:8083)
 * - UserService (:8081)
 * - InteractionService (:8085)
 */

const COURSE_BASE_URL = '/api/v1/course';
const UNIT_BASE_URL = '/api/v1/unit';
const CONTENT_BASE_URL = '/api/v1/content';
const USER_BASE_URL = '/api/v1/users';
const INTERACTION_BASE_URL = '/api/v1/interaction';

// Active User Local Storage
const DEFAULT_USER = {
  userId: '101',
  firstName: 'Elena',
  lastName: 'Rostova',
  email: 'elena.rostova@eduwerks.io',
  role: 'STUDENT',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
};

export function getActiveUser() {
  try {
    const saved = localStorage.getItem('eduwerks_active_user');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // ignore
  }
  return DEFAULT_USER;
}

export function setActiveUser(user) {
  try {
    localStorage.setItem('eduwerks_active_user', JSON.stringify(user));
  } catch (e) {
    // ignore
  }
}

// Local in-memory comments store initialized with realistic Eduwerks classroom discussions
let localComments = {
  'cnt-101': [
    {
      commentId: 'cm-1',
      contentId: 'cnt-101',
      userId: '201',
      authorName: 'Prof. David Vance',
      authorRole: 'INSTRUCTOR',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      commentText: 'Welcome everyone! In this lecture, pay special attention to how service registries decouple ephemeral container IPs from client communication.',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      likes: 14,
      replies: [
        {
          commentId: 'cm-1-1',
          contentId: 'cnt-101',
          userId: '101',
          authorName: 'Elena Rostova',
          authorRole: 'STUDENT',
          authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
          commentText: 'Professor, will Eureka automatically purge zombie pods if heartbeats are missed, or do we tune eviction timers?',
          createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
          likes: 4
        },
        {
          commentId: 'cm-1-2',
          contentId: 'cnt-101',
          userId: '201',
          authorName: 'Prof. David Vance',
          authorRole: 'INSTRUCTOR',
          authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
          commentText: 'Great question Elena! In production, leaseExpirationDurationInSeconds defaults to 90s, but in dev we tighten it to 10s.',
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          likes: 7
        }
      ]
    },
    {
      commentId: 'cm-2',
      contentId: 'cnt-101',
      userId: '105',
      authorName: 'Marcus Sterling',
      authorRole: 'STUDENT',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      commentText: 'The network topology diagram at 04:15 makes the OpenFeign connection crystal clear. Thanks!',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      likes: 5,
      replies: []
    }
  ]
};

// Rich default dataset for fallback
let localCourses = [
  {
    courseId: 'c101-microservices-arch',
    title: 'Cloud-Native Architecture: Spring Boot 3 & Netflix Eureka',
    description: 'Master production microservices architecture with Spring Boot 3, Netflix Eureka, OpenFeign declarative clients, PostgreSQL, and MinIO S3 Object Storage.',
    category: 'Cloud & Architecture',
    courseLevel: 'ADVANCED',
    price: 89.99,
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    courseState: 'PUBLISHED',
    instructorName: 'Prof. David Vance',
    instructorTitle: 'Cloud Architect & Staff Engineer',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    rating: 4.9,
    studentsCount: 1420,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    units: [
      {
        unitId: 'u101-eureka-intro',
        courseId: 'c101-microservices-arch',
        title: 'Module 1: Service Registry & Discovery Foundations',
        description: 'Understand Netflix Eureka Server configuration, peer replication, heartbeats, and client instance registration.',
        unitIndex: 1,
        contents: [
          {
            contentId: 'cnt-101',
            courseId: 'c101-microservices-arch',
            unitId: 'u101-eureka-intro',
            lessonIndex: '1',
            title: 'Welcome & Microservices Topology Walkthrough',
            description: 'Decomposing the monolith: Why service discovery matters at enterprise scale.',
            duration: 480,
            contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
          },
          {
            contentId: 'cnt-102',
            courseId: 'c101-microservices-arch',
            unitId: 'u101-eureka-intro',
            lessonIndex: '2',
            title: 'Configuring Eureka Server & Standalone Mode',
            description: 'Disabling self-registration and optimizing eviction timers for development.',
            duration: 720,
            contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
          },
          {
            contentId: 'cnt-103',
            courseId: 'c101-microservices-arch',
            unitId: 'u101-eureka-intro',
            lessonIndex: '3',
            title: 'Client Registration & Instance Metadata Inspection',
            description: 'Inspecting live Eureka dashboard metrics and client lease expiration.',
            duration: 610,
            contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          }
        ]
      },
      {
        unitId: 'u102-feign-clients',
        courseId: 'c101-microservices-arch',
        title: 'Module 2: Declarative REST with Spring Cloud OpenFeign',
        description: 'Synchronous inter-service communication, fallback factories, circuit breakers, and custom error decoders.',
        unitIndex: 2,
        contents: [
          {
            contentId: 'cnt-104',
            courseId: 'c101-microservices-arch',
            unitId: 'u102-feign-clients',
            lessonIndex: '1',
            title: 'OpenFeign vs WebClient: Architectural Tradeoffs',
            description: 'Why declarative HTTP interfaces streamline microservices orchestration.',
            duration: 540,
            contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
          },
          {
            contentId: 'cnt-105',
            courseId: 'c101-microservices-arch',
            unitId: 'u102-feign-clients',
            lessonIndex: '2',
            title: 'Implementing Graceful Fallbacks for Resilience',
            description: 'Handling network partitions and downstream service outages gracefully.',
            duration: 830,
            contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
          }
        ]
      },
      {
        unitId: 'u103-minio-storage',
        courseId: 'c101-microservices-arch',
        title: 'Module 3: High-Performance Media Streaming with MinIO',
        description: 'S3-compatible object storage, bucket security, multipart high-definition video uploads, and presigned access.',
        unitIndex: 3,
        contents: [
          {
            contentId: 'cnt-106',
            courseId: 'c101-microservices-arch',
            unitId: 'u103-minio-storage',
            lessonIndex: '1',
            title: 'Setting Up MinIO S3 Buckets for Video Uploads',
            description: 'Bucket policies, access credentials, and SDK initialization in Spring Boot.',
            duration: 690,
            contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'
          }
        ]
      }
    ]
  },
  {
    courseId: 'c102-react-mastery',
    title: 'Full-Stack React 19 & Next-Gen State Management',
    description: 'Design blazing-fast reactive web applications with React 19 Compiler, Actions, asynchronous caching, and Eduwerks UI design.',
    category: 'Web Development',
    courseLevel: 'INTERMEDIATE',
    price: 69.99,
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80',
    courseState: 'PUBLISHED',
    instructorName: 'Sarah Jenkins',
    instructorTitle: 'Principal Frontend Architect',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    rating: 4.8,
    studentsCount: 2310,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    units: [
      {
        unitId: 'u201-react-foundations',
        courseId: 'c102-react-mastery',
        title: 'Module 1: React 19 Compiler & Actions',
        description: 'Deep dive into server actions, useActionState, optimistic updates, and useTransition.',
        unitIndex: 1,
        contents: [
          {
            contentId: 'cnt-201',
            courseId: 'c102-react-mastery',
            unitId: 'u201-react-foundations',
            lessonIndex: '1',
            title: 'React 19 Core Paradigm Shift',
            description: 'Exploring the new compiler and eliminating manual useMemo/useCallback.',
            duration: 510,
            contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
          }
        ]
      }
    ]
  },
  {
    courseId: 'c103-ai-cloud-native',
    title: 'Autonomous AI Agents: Retrieval-Augmented Generation (RAG)',
    description: 'Explore neural embeddings, vector indexing with pgvector, autonomous multi-agent chains, and LLM deployment.',
    category: 'AI & Data Science',
    courseLevel: 'ADVANCED',
    price: 99.99,
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    courseState: 'PUBLISHED',
    instructorName: 'Dr. Arthur Chen',
    instructorTitle: 'AI Research Director',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    rating: 5.0,
    studentsCount: 3890,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    units: [
      {
        unitId: 'u301-agent-architectures',
        courseId: 'c103-ai-cloud-native',
        title: 'Module 1: Vector Embeddings & Similarity Search',
        description: 'Mathematical intuition behind token vectors, cosine similarity, and approximate nearest neighbor search.',
        unitIndex: 1,
        contents: [
          {
            contentId: 'cnt-301',
            courseId: 'c103-ai-cloud-native',
            unitId: 'u301-agent-architectures',
            lessonIndex: '1',
            title: 'Semantic Vectors and Embedding Spaces',
            description: 'How high-dimensional vectors capture context and semantics.',
            duration: 640,
            contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
          }
        ]
      }
    ]
  },
  {
    courseId: 'c104-devops-kubernetes',
    title: 'Kubernetes Production Engineering: GitOps & CI/CD',
    description: 'Deploy resilient multi-cluster Kubernetes clusters with ArgoCD, Prometheus telemetry, zero-downtime rolling updates, and Istio Service Mesh.',
    category: 'DevOps & SRE',
    courseLevel: 'INTERMEDIATE',
    price: 79.99,
    thumbnailUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80',
    courseState: 'PUBLISHED',
    instructorName: 'Maya Thorne',
    instructorTitle: 'Site Reliability Lead',
    instructorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
    rating: 4.9,
    studentsCount: 1650,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    units: []
  }
];

// ==========================================
// 1. HEALTH CHECKS
// ==========================================

export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${COURSE_BASE_URL}/list`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function checkAllServicesHealth() {
  const checkEndpoint = async (url) => {
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 1800);
      const res = await fetch(url, { method: 'GET', signal: c.signal });
      clearTimeout(t);
      return res.status < 500;
    } catch {
      return false;
    }
  };

  const [course, unit, content, user, interaction] = await Promise.all([
    checkEndpoint(`${COURSE_BASE_URL}/list`),
    checkEndpoint(`${UNIT_BASE_URL}/course/c101-microservices-arch`),
    checkEndpoint(`${CONTENT_BASE_URL}/exists?contentId=cnt-101`),
    checkEndpoint(`${USER_BASE_URL}/profile?userId=1`),
    checkEndpoint(`${INTERACTION_BASE_URL}/status`)
  ]);

  return {
    course,
    unit,
    content,
    user,
    interaction,
    isAnyLive: course || unit || content || user || interaction
  };
}

// ==========================================
// 2. COURSESERVICE (:8082)
// ==========================================

export async function fetchAllCourses() {
  try {
    const res = await fetch(`${COURSE_BASE_URL}/list`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const courses = data.map(item => item.course || item);
    return { data: courses, isLive: true };
  } catch (error) {
    console.warn('[Eduwerks API] Fallback to local courses:', error.message);
    return { data: [...localCourses], isLive: false };
  }
}

export async function enterIntoCourse(courseId) {
  try {
    const res = await fetch(`${COURSE_BASE_URL}/view/${courseId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      course: data.course || null,
      units: data.units || [],
      isLive: true,
    };
  } catch (error) {
    console.warn(`[Eduwerks API] Offline course load for ${courseId}:`, error.message);
    const course = localCourses.find(c => c.courseId === courseId);
    if (!course) {
      throw new Error(`Course ${courseId} not found in database or demo catalog.`);
    }
    return {
      course: course,
      units: course.units || [],
      isLive: false,
    };
  }
}

export async function createCourse(formDataPayload) {
  try {
    const res = await fetch(`${COURSE_BASE_URL}/create`, {
      method: 'POST',
      body: formDataPayload,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || `Server error ${res.status}`);
    }
    const data = await res.json();
    return { success: true, data: data.course || data, isLive: true };
  } catch (error) {
    console.warn('[Eduwerks API] Offline fallback course creation:', error.message);
    const newCourse = {
      courseId: 'c-' + Math.random().toString(36).substring(2, 9),
      title: formDataPayload.get('title') || 'Untitled Course',
      description: formDataPayload.get('description') || '',
      category: formDataPayload.get('category') || 'General Education',
      courseLevel: formDataPayload.get('courseLevel') || 'BEGINNER',
      price: parseFloat(formDataPayload.get('price')) || 0,
      thumbnailUrl: formDataPayload.get('previewUrl') || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      courseState: 'DRAFT',
      instructorName: getActiveUser().firstName + ' ' + getActiveUser().lastName,
      instructorTitle: 'Course Creator',
      instructorAvatar: getActiveUser().avatarUrl,
      rating: 5.0,
      studentsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      units: []
    };
    localCourses.unshift(newCourse);
    return { success: true, data: newCourse, isLive: false };
  }
}

export async function updateCourse(courseId, formDataPayload) {
  try {
    const res = await fetch(`${COURSE_BASE_URL}/update/${courseId}`, {
      method: 'PUT',
      body: formDataPayload,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data: data.course || data, isLive: true };
  } catch (error) {
    console.warn('[Eduwerks API] Offline course update fallback:', error.message);
    const index = localCourses.findIndex(c => c.courseId === courseId);
    if (index !== -1) {
      localCourses[index] = {
        ...localCourses[index],
        title: formDataPayload.get('title') || localCourses[index].title,
        description: formDataPayload.get('description') || localCourses[index].description,
        category: formDataPayload.get('category') || localCourses[index].category,
        courseLevel: formDataPayload.get('courseLevel') || localCourses[index].courseLevel,
        price: parseFloat(formDataPayload.get('price')) || localCourses[index].price,
        updatedAt: new Date().toISOString(),
      };
      return { success: true, data: localCourses[index], isLive: false };
    }
    throw error;
  }
}

// ==========================================
// 3. UNITSERVICE (:8084)
// ==========================================

export async function createUnit(courseId, unitPayload) {
  try {
    const res = await fetch(`${UNIT_BASE_URL}/create?courseId=${encodeURIComponent(courseId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId: courseId,
        title: unitPayload.title,
        description: unitPayload.description,
        unitIndex: parseInt(unitPayload.unitIndex, 10) || 1,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data: data.unit || data, isLive: true };
  } catch (error) {
    console.warn('[Eduwerks API] Offline fallback unit creation:', error.message);
    const newUnit = {
      unitId: 'u-' + Math.random().toString(36).substring(2, 9),
      courseId: courseId,
      title: unitPayload.title || 'Untitled Unit',
      description: unitPayload.description || '',
      unitIndex: parseInt(unitPayload.unitIndex, 10) || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      contents: []
    };
    const course = localCourses.find(c => c.courseId === courseId);
    if (course) {
      if (!course.units) course.units = [];
      course.units.push(newUnit);
    }
    return { success: true, data: newUnit, isLive: false };
  }
}

export async function fetchUnitsByCourse(courseId) {
  try {
    const res = await fetch(`${UNIT_BASE_URL}/course/${courseId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data, isLive: true };
  } catch (error) {
    const course = localCourses.find(c => c.courseId === courseId);
    return { data: course?.units || [], isLive: false };
  }
}

export async function fetchCourseUnits(courseId) {
  try {
    const res = await fetch(`${COURSE_BASE_URL}/${courseId}/units`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data, isLive: true };
  } catch (error) {
    return fetchUnitsByCourse(courseId);
  }
}

export async function fetchContentsByCourse(courseId) {
  try {
    const res = await fetch(`${CONTENT_BASE_URL}/course/${courseId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data, isLive: true };
  } catch (error) {
    const course = localCourses.find(c => c.courseId === courseId);
    const contents = course?.units?.flatMap(u => u.contents || []) || [];
    return { data: contents, isLive: false };
  }
}

// ==========================================
// 4. CONTENTSERVICE (:8083)
// ==========================================

export async function uploadContent(courseId, unitId, formDataPayload) {
  try {
    const res = await fetch(`${CONTENT_BASE_URL}/upload?courseId=${encodeURIComponent(courseId)}&unitId=${encodeURIComponent(unitId)}`, {
      method: 'POST',
      body: formDataPayload,
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || `Server error ${res.status}`);
    }
    const data = await res.json();
    return { success: true, data: data.content || data, isLive: true };
  } catch (error) {
    console.warn('[Eduwerks API] Offline fallback content upload:', error.message);
    const newContent = {
      contentId: 'cnt-' + Math.random().toString(36).substring(2, 9),
      courseId: courseId,
      unitId: unitId,
      lessonIndex: formDataPayload.get('lessonIndex') || '1',
      title: formDataPayload.get('title') || 'New Lesson',
      description: formDataPayload.get('description') || '',
      duration: parseInt(formDataPayload.get('duration'), 10) || 300,
      contentUrl: formDataPayload.get('previewUrl') || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const course = localCourses.find(c => c.courseId === courseId);
    if (course && course.units) {
      const unit = course.units.find(u => u.unitId === unitId);
      if (unit) {
        if (!unit.contents) unit.contents = [];
        unit.contents.push(newContent);
      }
    }

    return { success: true, data: newContent, isLive: false };
  }
}

export async function fetchContentsByUnit(unitId) {
  try {
    const res = await fetch(`${CONTENT_BASE_URL}/unit/${unitId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data, isLive: true };
  } catch (error) {
    for (const c of localCourses) {
      const u = c.units?.find(unit => unit.unitId === unitId);
      if (u) return { data: u.contents || [], isLive: false };
    }
    return { data: [], isLive: false };
  }
}

// ==========================================
// 5. USERSERVICE (:8081)
// ==========================================

export async function registerUser(userData) {
  try {
    const res = await fetch(`${USER_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword || userData.password
      })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || `Registration failed (${res.status})`);
    }
    const data = await res.json();
    const newUser = {
      userId: String(data.userId || data.id || Math.floor(Math.random() * 1000) + 1),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: 'STUDENT',
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userData.firstName)}`
    };
    setActiveUser(newUser);
    return { success: true, data: newUser, isLive: true };
  } catch (error) {
    console.warn('[Eduwerks API] Fallback offline user registration:', error.message);
    const mockUser = {
      userId: String(Math.floor(Math.random() * 1000) + 1),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: 'STUDENT',
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userData.firstName)}`
    };
    setActiveUser(mockUser);
    return { success: true, data: mockUser, isLive: false };
  }
}

export async function fetchUserProfile(userId) {
  try {
    const res = await fetch(`${USER_BASE_URL}/profile?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data, isLive: true };
  } catch (error) {
    return { data: getActiveUser(), isLive: false };
  }
}

// ==========================================
// 6. INTERACTIONSERVICE (:8085)
// ==========================================

export async function fetchInteractionStatus() {
  try {
    const res = await fetch(`${INTERACTION_BASE_URL}/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { service: 'InteractionService', status: 'OFFLINE' };
  }
}

export async function fetchComments(contentId) {
  return localComments[contentId] || [];
}

export async function addComment(contentId, userId, parentCommentId, commentText) {
  const active = getActiveUser();
  const newComment = {
    commentId: 'cm-' + Date.now().toString(36),
    contentId: contentId,
    userId: userId || active.userId,
    authorName: active.firstName + ' ' + active.lastName,
    authorRole: active.role || 'STUDENT',
    authorAvatar: active.avatarUrl,
    commentText: commentText,
    createdAt: new Date().toISOString(),
    likes: 0,
    replies: []
  };

  try {
    let url = `${INTERACTION_BASE_URL}/add?contentId=${encodeURIComponent(contentId)}&userId=${encodeURIComponent(userId || active.userId)}`;
    if (parentCommentId) {
      url += `&parentCommentId=${encodeURIComponent(parentCommentId)}`;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ commentText: commentText })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.commentId) newComment.commentId = data.commentId;
    }
  } catch (error) {
    console.warn('[Eduwerks API] Offline fallback comment addition:', error.message);
  }

  // Update local cache
  if (!localComments[contentId]) {
    localComments[contentId] = [];
  }

  if (parentCommentId) {
    const parent = localComments[contentId].find(c => c.commentId === parentCommentId);
    if (parent) {
      if (!parent.replies) parent.replies = [];
      parent.replies.push(newComment);
    } else {
      localComments[contentId].push(newComment);
    }
  } else {
    localComments[contentId].push(newComment);
  }

  return { success: true, data: newComment };
}
