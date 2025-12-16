// src/pages/MahasiswaDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllCourses, enrollCourse, getStudentEnrollments } from '../services/courseService';
import { LogOut, BookOpen, Search, CheckCircle, PlayCircle, Image as ImageIcon } from 'lucide-react';
// Tambahkan useNavigate
import { useNavigate } from 'react-router-dom';


const MahasiswaDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]); // Semua data course
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]); // List ID course yang sudah diikuti
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' atau 'my_courses'
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Data saat pertama kali load
  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          // 1. Ambil semua course
          const allCourses = await getAllCourses();
          setCourses(allCourses);

          // 2. Ambil data enrollment mahasiswa ini
          const myEnrollments = await getStudentEnrollments(currentUser.uid);
          setEnrolledCourseIds(myEnrollments);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [currentUser]);

  // Handle tombol "Mulai Belajar"
  const handleEnroll = async (courseId) => {
    try {
        await enrollCourse(currentUser.uid, courseId);
        // Update state lokal agar tombol langsung berubah jadi 'Terdaftar'
        setEnrolledCourseIds([...enrolledCourseIds, courseId]);
        alert("Berhasil mendaftar kursus!");
    } catch (error) {
        alert(error.message);
    }
  };

  // Filter logika untuk Tab dan Search
  const filteredCourses = courses.filter(course => {
      // 1. Filter berdasarkan Tab
      const isEnrolled = enrolledCourseIds.includes(course.id);
      if (activeTab === 'my_courses' && !isEnrolled) return false;
      
      // 2. Filter berdasarkan Search
      if (searchTerm && !course.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      
      return true;
  });

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar" style={{ backgroundColor: '#0f172a' }}>
        <h2 className="brand">E-Learning</h2>
        <nav>
          <button 
            onClick={() => setActiveTab('catalog')} 
            className={`nav-link ${activeTab === 'catalog' ? 'active' : ''}`}
            style={{background:'none', border:'none', width:'100%', cursor:'pointer', fontSize:'1rem'}}
          >
            <Search size={18} /> Katalog Materi
          </button>

          <button 
            onClick={() => setActiveTab('my_courses')} 
            className={`nav-link ${activeTab === 'my_courses' ? 'active' : ''}`}
            style={{background:'none', border:'none', width:'100%', cursor:'pointer', fontSize:'1rem'}}
          >
            <BookOpen size={18} /> Kursus Saya
          </button>

          <button onClick={logout} className="nav-link btn-logout">
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <h3>Halo, {currentUser?.displayName || "Mahasiswa"}</h3>
          <span className="badge-mhs">Student Area</span>
        </header>

        <div className="content-area">
           <div style={{ marginBottom: '20px' }}>
                <h2 style={{ marginBottom: '10px' }}>
                    {activeTab === 'catalog' ? 'Katalog Materi Tersedia' : 'Materi Pembelajaran Saya'}
                </h2>
                
                {/* Search Bar */}
                <div style={{ position: 'relative', maxWidth: '400px' }}>
                    <input 
                        type="text" 
                        placeholder="Cari materi pelajaran..." 
                        className="form-input"
                        style={{ paddingLeft: '40px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search size={20} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                </div>
           </div>

           {loading ? (
               <p>Memuat materi...</p>
           ) : filteredCourses.length === 0 ? (
               <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                   <p>Tidak ada materi ditemukan {activeTab === 'my_courses' && 'di daftar kursus Anda'}.</p>
                   {activeTab === 'my_courses' && (
                       <button className="btn btn-primary" onClick={() => setActiveTab('catalog')} style={{ marginTop: '10px' }}>
                           Cari di Katalog
                       </button>
                   )}
               </div>
           ) : (
               <div className="course-grid">
                   {filteredCourses.map(course => {
                       const isEnrolled = enrolledCourseIds.includes(course.id);
                       
                       return (
                           <div key={course.id} className="course-card">
                               {course.imageUrl ? (
                                   <img src={course.imageUrl} alt={course.title} className="course-image" />
                               ) : (
                                   <div className="course-image" style={{display:'flex', alignItems:'center', justifyContent:'center', color:'#999'}}>
                                       <ImageIcon size={40} />
                                   </div>
                               )}

                               <div className="course-content">
                                   <div>
                                       <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                            <span className="badge-info" style={{marginBottom:'5px'}}>
                                                Oleh: {course.dosenName || 'Dosen'}
                                            </span>
                                            {isEnrolled && <CheckCircle size={20} color="#16a34a" />}
                                       </div>
                                       
                                       <h3 className="course-title">{course.title}</h3>
                                       <p className="course-desc">
                                           {course.description.length > 80 
                                            ? course.description.substring(0, 80) + '...' 
                                            : course.description}
                                       </p>
                                   </div>

                                   <div style={{ marginTop: 'auto', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                    {isEnrolled ? (
                                        <button 
                                            // Update onClick disini:
                                            onClick={() => navigate(`/course/${course.id}`)}
                                            
                                            className="btn" 
                                            style={{ 
                                                width: '100%', 
                                                backgroundColor: '#16a34a', 
                                                color: 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
                                            }}
                                        >
                                            <PlayCircle size={18} /> Lanjut Belajar
                                        </button>
                                    ) : (
                                           <button 
                                                onClick={() => handleEnroll(course.id)}
                                                className="btn btn-primary" 
                                                style={{ width: '100%' }}
                                            >
                                               Mulai Belajar
                                           </button>
                                       )}
                                   </div>
                               </div>
                           </div>
                       )
                   })}
               </div>
           )}
        </div>
      </main>
    </div>
  );
};

export default MahasiswaDashboard;