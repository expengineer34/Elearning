// src/pages/CourseDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { getCourseById } from '../services/courseService';
import { 
    getLessonsByCourse, 
    markLessonComplete, 
    getCompletedLessons 
} from '../services/lessonService'; // Import fungsi baru
import { 
    ArrowLeft, PlayCircle, FileText, CheckCircle, 
    Paperclip, Download, Circle 
} from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Ambil data user
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState([]); // State Checklist
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ambil data Course & Lessons
        const courseData = await getCourseById(id);
        const lessonData = await getLessonsByCourse(id);
        setCourse(courseData);
        setLessons(lessonData);
        
        if (lessonData.length > 0) setActiveLesson(lessonData[0]);

        // 2. Ambil data Progress (Materi yg sudah selesai)
        if (currentUser) {
            const completed = await getCompletedLessons(currentUser.uid, id);
            setCompletedLessonIds(completed);
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, currentUser]);

  // Fungsi Handle Tombol Selesai
  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    try {
        await markLessonComplete(currentUser.uid, id, activeLesson.id);
        // Update state lokal biar langsung centang tanpa refresh
        setCompletedLessonIds([...completedLessonIds, activeLesson.id]);
    } catch (error) {
        alert("Gagal menyimpan progres: " + error.message);
    }
  };

  const getYoutubeEmbed = (url) => {
    if(!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) return <div className="page-center">Memuat kelas...</div>;

  // Cek apakah lesson yang sedang dibuka SUDAH selesai
  const isCurrentLessonCompleted = activeLesson && completedLessonIds.includes(activeLesson.id);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: '350px', backgroundColor: 'white', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#666', marginBottom:'10px' }}>
                <ArrowLeft size={16} /> Kembali
            </button>
            <h2 style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}>{course?.title}</h2>
            
            {/* Progress Bar Sederhana */}
            <div style={{marginTop:'10px', fontSize:'0.8rem', color:'#666'}}>
                Progress: {completedLessonIds.length} / {lessons.length} Materi Selesai
            </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
            {lessons.map((lesson, index) => {
                const isCompleted = completedLessonIds.includes(lesson.id);
                
                return (
                    <div 
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        style={{ 
                            padding: '15px 20px', 
                            borderBottom: '1px solid #f1f5f9', 
                            cursor: 'pointer',
                            backgroundColor: activeLesson?.id === lesson.id ? '#eff6ff' : 'white',
                            borderLeft: activeLesson?.id === lesson.id ? '4px solid var(--primary-color)' : '4px solid transparent'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {/* Indikator Status (Centang Hijau atau Nomor) */}
                            {isCompleted ? (
                                <CheckCircle size={18} color="#16a34a" fill="#dcfce7" />
                            ) : (
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8', width:'18px', textAlign:'center' }}>{index + 1}</span>
                            )}
                            
                            <div style={{flex: 1}}>
                                <div style={{ fontSize: '0.9rem', fontWeight: activeLesson?.id === lesson.id ? 'bold' : 'normal', color: isCompleted ? '#16a34a' : 'inherit' }}>
                                    {lesson.title}
                                </div>
                                <div style={{display:'flex', alignItems:'center', gap:'5px', fontSize:'0.75rem', color:'#94a3b8'}}>
                                    {lesson.type === 'video' ? 'Video' : 'Artikel'}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
      </aside>

      {/* CONTENT AREA */}
      <main style={{ flex: 1, backgroundColor: '#f8fafc', overflowY: 'auto', padding: '40px' }}>
        {activeLesson ? (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{marginBottom:'20px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <h1 style={{ margin:0 }}>{activeLesson.title}</h1>
                    {isCurrentLessonCompleted && (
                        <span style={{background:'#dcfce7', color:'#166534', padding:'5px 10px', borderRadius:'20px', fontSize:'0.8rem', display:'flex', alignItems:'center', gap:'5px'}}>
                            <CheckCircle size={14} /> Selesai
                        </span>
                    )}
                </div>
                
                {/* KONTEN */}
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', marginBottom: '20px' }}>
                    {activeLesson.type === 'video' ? (
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', backgroundColor:'black' }}>
                            {getYoutubeEmbed(activeLesson.content) ? (
                                <iframe 
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                    src={`https://www.youtube.com/embed/${getYoutubeEmbed(activeLesson.content)}`} 
                                    title="Video Player" 
                                    frameBorder="0" 
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'white'}}>Link Video Tidak Valid</div>
                            )}
                        </div>
                    ) : (
                        <article style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
                             <p style={{whiteSpace: 'pre-wrap'}}>{activeLesson.content}</p>
                        </article>
                    )}
                </div>

                {/* LAMPIRAN */}
                {activeLesson.attachmentUrl && (
                    <div style={{ 
                        backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '15px 20px', 
                        borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' 
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ background: 'white', padding: '8px', borderRadius: '50%' }}><FileText size={24} color="#0ea5e9" /></div>
                            <div>
                                <h4 style={{ margin: 0, color: '#0f172a' }}>Materi Tambahan (PDF)</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Unduh materi untuk dipelajari offline.</p>
                            </div>
                        </div>
                        <a href={activeLesson.attachmentUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ backgroundColor: '#0ea5e9', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Download size={18} /> Download
                        </a>
                    </div>
                )}

                {/* TOMBOL ACTION */}
                <div style={{ marginTop: '30px', textAlign: 'right' }}>
                    {isCurrentLessonCompleted ? (
                        <button disabled className="btn" style={{ backgroundColor: '#e2e8f0', color: '#64748b', cursor:'default' }}>
                            <CheckCircle size={18} style={{marginRight:'5px'}} /> Sudah Selesai
                        </button>
                    ) : (
                        <button onClick={handleMarkComplete} className="btn btn-primary">
                            <Circle size={18} style={{marginRight:'5px'}} /> Tandai Selesai
                        </button>
                    )}
                </div>
            </div>
        ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8' }}>
                <p>Pilih materi di samping untuk mulai belajar.</p>
            </div>
        )}
      </main>

    </div>
  );
};

export default CourseDetail;