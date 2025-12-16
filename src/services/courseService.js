// src/services/courseService.js
import { db } from '../config/firebase';
import { 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc, 
    query, 
    where,
    getDoc, 
} from 'firebase/firestore';
import axios from 'axios';

const COURSE_COLLECTION = 'courses';

// --- 1. UPLOAD KE CLOUDINARY (Ini yang tadi error/hilang) ---
export const uploadImageToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_PRESET;

    // Cek apakah config sudah benar
    if (!cloudName || !uploadPreset) {
        throw new Error("Konfigurasi Cloudinary belum dipasang di .env");
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            formData
        );
        return response.data.secure_url;
    } catch (error) {
        console.error("Error upload cloudinary:", error);
        throw new Error("Gagal upload gambar");
    }
};

// --- 2. Create Course (Dosen) ---
export const addCourse = async (courseData) => {
    try {
        const docRef = await addDoc(collection(db, COURSE_COLLECTION), {
            ...courseData,
            createdAt: new Date()
        });
        return docRef.id;
    } catch (error) {
        throw error;
    }
};

// --- 3. Get Courses by Dosen (Dosen) ---
export const getCoursesByDosen = async (dosenId) => {
    try {
        const q = query(collection(db, COURSE_COLLECTION), where("dosenId", "==", dosenId));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw error;
    }
};

// --- 4. Delete Course (Dosen) ---
export const deleteCourse = async (courseId) => {
    try {
        const courseRef = doc(db, COURSE_COLLECTION, courseId);
        await deleteDoc(courseRef);
    } catch (error) {
        throw error;
    }
};

// --- 5. Get ALL Courses (Mahasiswa - Katalog) ---
export const getAllCourses = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, COURSE_COLLECTION));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw error;
    }
};

// --- 6. Cek Enrollment (Mahasiswa) ---
export const getStudentEnrollments = async (studentId) => {
    try {
        const q = query(collection(db, "enrollments"), where("studentId", "==", studentId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data().courseId);
    } catch (error) {
        throw error;
    }
};

// --- 7. Enroll Course (Mahasiswa) ---
export const enrollCourse = async (studentId, courseId) => {
    try {
        const q = query(
            collection(db, "enrollments"), 
            where("studentId", "==", studentId),
            where("courseId", "==", courseId)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            throw new Error("Anda sudah terdaftar di kursus ini.");
        }

        await addDoc(collection(db, "enrollments"), {
            studentId,
            courseId,
            enrolledAt: new Date()
        });
    } catch (error) {
        throw error;
    }
};

// 8. Ambil Detail Satu Course (Untuk halaman belajar)
export const getCourseById = async (courseId) => {
    try {
        const docRef = doc(db, COURSE_COLLECTION, courseId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            throw new Error("Materi tidak ditemukan!");
        }
    } catch (error) {
        throw error;
    }
};

// --- FUNGSI BARU: UPLOAD PDF/FILE ---
export const uploadFileToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_PRESET;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    
    // PENTING: Gunakan 'auto' agar Cloudinary mendeteksi ini PDF/Raw file
    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
            formData
        );
        return response.data.secure_url; // Mengembalikan URL PDF
    } catch (error) {
        console.error("Error upload file:", error);
        throw new Error("Gagal upload file");
    }
};