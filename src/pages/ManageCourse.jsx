// src/pages/ManageCourse.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '../services/courseService';
import { addLesson, getLessonsByCourse, deleteLesson } from '../services/lessonService';
import { uploadFileToCloudinary } from '../services/courseService'; // Import fungsi upload baru
import { ArrowLeft, Plus, Trash2, Video, FileText, Paperclip, Loader } from 'lucide-react';

const ManageCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  
  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('video');
  const [content, setContent] = useState('');
  const [pdfFile, setPdfFile] = useState(null); // State untuk file PDF
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const courseData = await getCourseById(id);
      setCourse(courseData);
      refreshLessons();
    };
    fetchData();
  }, [id]);

  const refreshLessons = async () => {
    const data = await getLessonsByCourse(id);
    setLessons(data);
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if(!title || !content) return alert("Judul dan Konten wajib diisi!");

    setLoading(true);
    try {
        let attachmentUrl = ""; // Default kosong

        // 1. Jika ada PDF, upload dulu
        if (pdfFile) {
            attachmentUrl = await uploadFileToCloudinary(pdfFile);
        }

        // 2. Simpan data lesson + URL lampiran
        await addLesson({
            courseId: id,
            title,
            type,
            content,
            attachmentUrl: attachmentUrl // Simpan URL PDF di database
        });

        // Reset Form
        setTitle('');
        setContent('');
        setPdfFile(null); // Reset file input
        refreshLessons();
        alert("Materi berhasil ditambahkan!");
    } catch (error) {
        alert("Gagal menambah materi: " + error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (lessonId) => {
    if(confirm("Hapus materi ini?")) {
        await deleteLesson(lessonId);
        refreshLessons();
    }
  };

  return (
    <div className="container" style={{ marginTop: '2rem', paddingBottom: '3rem' }}>
        <button onClick={() => navigate('/dashboard')} className="btn" style={{marginBottom:'1rem', background:'#e2e8f0', display:'flex', alignItems:'center', gap:'5px'}}>
            <ArrowLeft size={16} /> Kembali
        </button>

        <header style={{ marginBottom: '2rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
            <h1 style={{color: 'var(--primary-color)'}}>Kelola Kurikulum</h1>
            <h3>Course: {course?.title}</h3>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px' }}>
            
            {/* Form Tambah Materi */}
            <div className="card" style={{ height: 'fit-content' }}>
                <h3 style={{marginBottom:'1rem'}}>Tambah Materi Baru</h3>
                <form onSubmit={handleAddLesson}>
                    <div className="form-group">
                        <label>Judul Bab</label>
                        <input type="text" className="form-input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Contoh: Bab 1 - Pendahuluan" />
                    </div>
                    
                    <div className="form-group">
                        <label>Tipe Konten Utama</label>
                        <select className="form-input" value={type} onChange={e=>setType(e.target.value)}>
                            <option value="video">Video (YouTube)</option>
                            <option value="text">Artikel (Teks)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>{type === 'video' ? 'Link YouTube' : 'Isi Artikel'}</label>
                        {type === 'video' ? (
                            <input type="text" className="form-input" value={content} onChange={e=>setContent(e.target.value)} placeholder="https://youtube.com/..." />
                        ) : (
                            <textarea className="form-input" rows="4" value={content} onChange={e=>setContent(e.target.value)} placeholder="Tulis materi disini..."></textarea>
                        )}
                    </div>

                    {/* INPUT LAMPIRAN PDF (BARU) */}
                    <div className="form-group" style={{ background:'#f8fafc', padding:'10px', borderRadius:'8px', border:'1px dashed #cbd5e1' }}>
                        <label style={{display:'flex', alignItems:'center', gap:'5px', marginBottom:'5px', fontWeight:'bold', fontSize:'0.9rem'}}>
                            <Paperclip size={16} /> Lampiran PDF (Opsional)
                        </label>
                        <input 
                            type="file" 
                            accept=".pdf"
                            className="form-input"
                            style={{fontSize:'0.9rem'}}
                            onChange={(e) => setPdfFile(e.target.files[0])}
                        />
                        <small style={{color:'#64748b'}}>Hanya file PDF yang diperbolehkan.</small>
                    </div>

                    <button disabled={loading} className="btn btn-primary" style={{width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
                        {loading ? <Loader className="animate-spin" size={16} /> : <Plus size={16} />} 
                        {loading ? 'Mengupload...' : 'Simpan Materi'}
                    </button>
                </form>
            </div>

            {/* Daftar Materi */}
            <div>
                <h3 style={{marginBottom:'1rem'}}>Daftar Materi ({lessons.length})</h3>
                {lessons.length === 0 && <p style={{color:'#666'}}>Belum ada materi.</p>}
                
                <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    {lessons.map((lesson, index) => (
                        <div key={lesson.id} style={{ 
                            background:'white', padding:'15px', borderRadius:'var(--radius)', 
                            boxShadow:'var(--shadow)', display:'flex', justifyContent:'space-between', alignItems:'center'
                        }}>
                            <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                                <span style={{fontWeight:'bold', color:'#94a3b8', width:'20px'}}>#{index + 1}</span>
                                
                                {lesson.type === 'video' ? <Video size={20} color="#3b82f6" /> : <FileText size={20} color="#10b981" />}
                                
                                <div>
                                    <div style={{fontWeight:'600'}}>{lesson.title}</div>
                                    <div style={{fontSize:'0.8rem', color:'#666', display:'flex', gap:'10px', alignItems:'center'}}>
                                        <span>{lesson.type.toUpperCase()}</span>
                                        {/* Indikator jika ada lampiran */}
                                        {lesson.attachmentUrl && (
                                            <span style={{display:'flex', alignItems:'center', gap:'3px', color:'#f59e0b'}}>
                                                <Paperclip size={12} /> PDF
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button onClick={()=>handleDelete(lesson.id)} style={{border:'none', background:'none', color:'#ef4444', cursor:'pointer', padding:'5px'}}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default ManageCourse;