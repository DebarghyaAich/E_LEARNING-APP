/**
 * EduFlow Frontend API Service
 * Centralized client for CourseService (:8082), UnitService (:8084), and ContentService (:8083).
 */

const COURSE_BASE_URL = '/api/v1/course';
const UNIT_BASE_URL = '/api/v1/unit';
const CONTENT_BASE_URL = '/api/v1/content';

// Rich fallback dataset with full hierarchical data (Course -> Units -> Contents)
let localCourses = [
  {
    courseId: 'c101-microservices-arch',
    title: 'Building Cloud-Native Microservices with Spring Boot & Eureka',
    description: 'Master production microservices architecture with Spring Boot 3, Spring Cloud Netflix Eureka, OpenFeign, PostgreSQL, and MinIO Object Storage.',
    category: 'Cloud & Architecture',
    courseLevel: 'ADVANCED',
    price: 89.99,
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    courseState: 'PUBLISHED',
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
    title: 'Full-Stack Modern React 19 & Next-Gen State Architecture',
    description: 'Design blazing-fast React applications with reactive state hooks, asynchronous caching, glassmorphic UI, and Vite.',
    category: 'Web Development',
    courseLevel: 'INTERMEDIATE',
    price: 69.99,
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80',
    courseState: 'PUBLISHED',
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
    title: 'Autonomous AI Agents: RAG & Cloud Deployment',
    description: 'Explore neural network inference, retrieval augmented generation (RAG), vector databases, and autonomous LLM agent systems.',
    category: 'AI & Data Science',
    courseLevel: 'BEGINNER',
    price: 99.99,
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80',
    courseState: 'PUBLISHED',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    units: [
      {
        unitId: 'u301-ai-intro',
        courseId: 'c103-ai-cloud-native',
        title: 'Module 1: Vector Embeddings & Similarity Search',
        description: 'Building embedding pipelines with pgvector and LangChain.',
        unitIndex: 1,
        contents: [
          {
            contentId: 'cnt-301',
            courseId: 'c103-ai-cloud-native',
            unitId: 'u301-ai-intro',
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
    title: 'Kubernetes in Production: GitOps & Resilient CI/CD',
    description: 'Deploy resilient multi-cluster Kubernetes environments with ArgoCD, Prometheus telemetry, zero-downtime rolling updates, and Istio.',
    category: 'DevOps & SRE',
    courseLevel: 'ADVANCED',
    price: 79.99,
    thumbnailUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80',
    courseState: 'PUBLISHED',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    units: []
  }
];

// Check if live microservices backend is available
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

/**
 * Fetch all courses from CourseService (GET /api/v1/course/list)
 */
export async function fetchAllCourses() {
  try {
    const res = await fetch(`${COURSE_BASE_URL}/list`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const courses = data.map(item => item.course || item);
    return { data: courses, isLive: true };
  } catch (error) {
    console.warn('[EduFlow API] Using fallback offline courses:', error.message);
    return { data: [...localCourses], isLive: false };
  }
}

/**
 * Enter into course via CourseService (GET /api/v1/course/view/{courseId}).
 * CourseService aggregates units via UnitService Feign, and contents via ContentService Feign.
 */
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
    console.warn(`[EduFlow API] Falling back to offline dataset for course ${courseId}:`, error.message);
    const course = localCourses.find(c => c.courseId === courseId) || null;
    return {
      course,
      units: course?.units || [],
      isLive: false,
    };
  }
}

/**
 * Create a new course via CourseService (POST /api/v1/course/create, multipart/form-data)
 */
export async function createCourse(formDataPayload) {
  try {
    const res = await fetch(`${COURSE_BASE_URL}/create`, {
      method: 'POST',
      body: formDataPayload,
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || `Server error ${res.status}`);
    }
    const data = await res.json();
    return { success: true, data: data.course || data, isLive: true };
  } catch (error) {
    console.warn('[EduFlow API] Offline fallback course creation:', error.message);
    const newCourse = {
      courseId: 'c-' + Math.random().toString(36).substring(2, 9),
      title: formDataPayload.get('title') || 'Untitled Course',
      description: formDataPayload.get('description') || '',
      category: formDataPayload.get('category') || 'Technology',
      courseLevel: formDataPayload.get('courseLevel') || 'BEGINNER',
      price: parseFloat(formDataPayload.get('price')) || 49.99,
      thumbnailUrl: formDataPayload.get('thumbnailPreviewUrl') || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      courseState: 'PUBLISHED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      units: []
    };
    localCourses = [newCourse, ...localCourses];
    return { success: true, data: newCourse, isLive: false };
  }
}

/**
 * Update an existing course via CourseService (PUT /api/v1/course/update/{courseId})
 */
export async function updateCourse(courseId, formDataPayload) {
  try {
    const res = await fetch(`${COURSE_BASE_URL}/update/${courseId}`, {
      method: 'PUT',
      body: formDataPayload,
    });
    if (!res.ok) throw new Error(`Server error ${res.status}`);
    const data = await res.json();
    return { success: true, data: data.course || data, isLive: true };
  } catch (error) {
    console.warn(`[EduFlow API] Offline fallback update for course ${courseId}:`, error.message);
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

/**
 * Create a new unit via UnitService (POST /api/v1/unit/create?courseId=...)
 */
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
    console.warn('[EduFlow API] Offline fallback unit creation:', error.message);
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

/**
 * Fetch all units for a course via UnitService (GET /api/v1/unit/course/{courseId})
 */
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

/**
 * Upload lesson content/media via ContentService (POST /api/v1/content/upload?courseId=...&unitId=...)
 */
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
    console.warn('[EduFlow API] Offline fallback content upload:', error.message);
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

    // Update in local store
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

/**
 * Fetch all contents for a specific unit via ContentService (GET /api/v1/content/unit/{unitId})
 */
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
