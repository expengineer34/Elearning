// src/pages/DosenDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addCourse, getCoursesByDosen, deleteCourse, uploadImageToCloudinary } from '../services/courseService';
import { LogOut, BookOpen, PlusCircle, Trash2, X, Image as ImageIcon, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DosenDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Form
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [imageFile, setImageFile] = useState(null); // File mentah
  const [previewUrl, setPreviewUrl] = useState(null); // Preview gambar
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [currentUser]);

  const fetchCourses = async () => {
    if (currentUser) {
      try {
        const data = await getCoursesByDosen(currentUser.uid);
        setCourses(data);
      } catch (error) {
        console.error("Gagal ambil data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle User Pilih File
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setImageFile(file);
        // Buat preview lokal biar user lihat sebelum upload
        setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let imageUrl = ""; // Default kosong jika tidak upload gambar

      // 1. Jika ada file, upload dulu ke Cloudinary
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      // 2. Simpan data course + URL gambar ke Firestore
      await addCourse({
        title: formData.title,
        description: formData.description,
        imageUrl: imageUrl, // Simpan URL disini
        dosenId: currentUser.uid,
        dosenName: currentUser.displayName || "Dosen"
      });
      
      // Reset State
      setFormData({ title: '', description: '' });
      setImageFile(null);
      setPreviewUrl(null);
      setShowForm(false);
      fetchCourses();

    } catch (error) {
      alert("Error: " + error.message);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus materi ini?")) {
      try {
        await deleteCourse(id);
        fetchCourses();
      } catch (error) {
        alert("Gagal menghapus");
      }
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h2 className="brand">E-Dosen</h2>
        <nav>
          <div className="nav-link active"><BookOpen size={18} /> Kelola Materi</div>
          <button onClick={logout} className="nav-link btn-logout">
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <h3>Dashboard Pengajar</h3>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
             <span>{currentUser?.email}</span>
             <span className="badge-dosen">Dosen</span>
          </div>
        </header>

        <div className="content-area">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Daftar Materi Kuliah</h2>
            
            {!showForm && (
                <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', gap: '5px', alignItems: 'center'}}>
                    <PlusCircle size={18} /> Tambah Materi
                </button>
            )}
          </div>

          {showForm && (
            <div className="form-card">
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1rem'}}>
                    <h3>Buat Materi Baru</h3>
                    <button onClick={() => setShowForm(false)} style={{background:'none', border:'none', cursor:'pointer'}}>
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Judul Materi</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Upload Cover Gambar</label>
                        <input 
                            type="file" 
                            className="form-input" 
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                        {/* Preview Area */}
                        {previewUrl && (
                            <div style={{ marginTop: '10px' }}>
                                <img src={previewUrl} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Deskripsi Singkat</label>
                        <textarea 
                            className="form-input" 
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
                        ></textarea>
                    </div>
                    
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Mengupload...' : 'Simpan Materi'}
                    </button>
                </form>
            </div>
          )}

          {loading ? (
             <p>Memuat data...</p>
          ) : courses.length === 0 ? (
             <div className="card" style={{textAlign:'center', color:'#666'}}>
                <p>Belum ada materi.</p>
             </div>
          ) : (
             <div className="course-grid">
                {courses.map((course) => (
                    <div key={course.id} className="course-card">
                        {/* Tampilkan gambar jika ada, jika tidak pakai placeholder warna */}
                        {course.imageUrl ? (
                             <img src={course.imageUrl} alt={course.title} className="course-image" />
                        ) : (
                             <div className="course-image" style={{display:'flex', alignItems:'center', justifyContent:'center', color:'#999'}}>
                                <ImageIcon size={40} />
                             </div>
                        )}
                        
                        <div className="course-content">
                            <div>
                                <span className="badge-info">Materi Kuliah</span>
                                <h3 className="course-title">{course.title}</h3>
                                <p className="course-desc">{course.description}</p>
                            </div>
                            <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                {/* Tombol Baru: Edit Materi */}
                                <button 
                                    onClick={() => navigate(`/manage-course/${course.id}`)} 
                                    className="btn"
                                    style={{ flex: 1, backgroundColor: '#f59e0b', color: 'white', display:'flex', justifyContent:'center', gap:'5px', alignItems:'center', fontSize:'0.9rem' }}
                                >
                                    <Edit size={16} /> Kelola Materi
                                </button>

                                <button 
                                    onClick={() => handleDelete(course.id)} 
                                    className="btn-danger"
                                    style={{ width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    title="Hapus Course"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DosenDashboard;