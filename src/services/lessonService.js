// src/services/lessonService.js
import { db } from '../config/firebase';
import { 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc, 
    query, 
    where,
    orderBy 
} from 'firebase/firestore';
import { setDoc } from 'firebase/firestore';

const LESSON_COLLECTION = 'lessons';

// 1. Tambah Lesson Baru ke dalam Course
export const addLesson = async (lessonData) => {
    try {
        await addDoc(collection(db, LESSON_COLLECTION), {
            ...lessonData,
            createdAt: new Date()
        });
    } catch (error) {
        throw error;
    }
};

// 2. Ambil Semua Lesson berdasarkan Course ID
export const getLessonsByCourse = async (courseId) => {
    try {
        const q = query(
            collection(db, LESSON_COLLECTION), 
            where("courseId", "==", courseId),
            orderBy("createdAt", "asc") // Urutkan dari yang pertama dibuat
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        throw error;
    }
};

// 3. Hapus Lesson
export const deleteLesson = async (lessonId) => {
    try {
        await deleteDoc(doc(db, LESSON_COLLECTION, lessonId));
    } catch (error) {
        throw error;
    }
};

// 4. Tandai Materi Selesai
export const markLessonComplete = async (studentId, courseId, lessonId) => {
    try {
        // Kita gunakan ID unik gabungan (studentId_lessonId) 
        // agar satu mahasiswa tidak bisa duplikat data selesai untuk lesson yang sama
        const docId = `${studentId}_${lessonId}`;
        
        await setDoc(doc(db, "completed_lessons", docId), {
            studentId,
            courseId,
            lessonId,
            completedAt: new Date()
        });
    } catch (error) {
        throw error;
    }
};

// 5. Ambil Daftar Materi yang Sudah Selesai (Checklist)
export const getCompletedLessons = async (studentId, courseId) => {
    try {
        const q = query(
            collection(db, "completed_lessons"),
            where("studentId", "==", studentId),
            where("courseId", "==", courseId)
        );
        const snapshot = await getDocs(q);
        // Kita hanya butuh list ID lesson-nya saja
        return snapshot.docs.map(doc => doc.data().lessonId);
    } catch (error) {
        throw error;
    }
};