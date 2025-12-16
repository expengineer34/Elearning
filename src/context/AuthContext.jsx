// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

// Custom hook agar lebih mudah dipanggil di halaman lain
export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // Menyimpan role: 'dosen' atau 'mahasiswa'
    const [loading, setLoading] = useState(true);

    // Fungsi Register (Sign Up)
    // Selain buat akun di Auth, kita simpan Role di Firestore
    async function register(email, password, name, role) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Simpan data tambahan ke Firestore collection 'users'
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: name,
            email: email,
            role: role, // 'dosen' atau 'mahasiswa'
            createdAt: new Date()
        });

        return userCredential;
    }

    // Fungsi Login
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Fungsi Logout
    function logout() {
        return signOut(auth);
    }

    // Memantau perubahan status login (Observer)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Jika user login, ambil data role dari Firestore
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    setUserRole(docSnap.data().role);
                }
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        register,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}