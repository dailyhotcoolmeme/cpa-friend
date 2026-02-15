import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  Lock, Save, Trash2, Briefcase, Plus, X, Image as ImageIcon, Users, Info, Upload, Loader2
} from 'lucide-react';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

const CATEGORIES = [
  { id: 'accounting', name: '회계 정보' },
  { id: 'tax', name: '세무 정보' },
  { id: 'nonprofit', name: '비영리 법인' }
];

export default function AdminHome() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inputPw, setInputPw] = useState('');
  const [activeTab, setActiveTab] = useState('team');
  const [isUploading, setIsUploading] = useState(false);

  // State for different sections
  const [staffs, setStaffs] = useState([]);
  const [services, setServices] = useState([]);
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);

  async function checkPassword() {
    const { data } = await supabase.from('admin_config').select('value').eq('key', 'admin_password').single();
    if (data && data.value === inputPw) {
      setIsAuthorized(true);
      loadAllData();
    } else { alert('비밀번호가 틀렸습니다.'); }
  }

  async function loadAllData() {
    const { data: s } = await supabase.from('staff').select('*').order('sort_order');
    const { data: sv } = await supabase.from('services').select('*').order('sort_order');
    const { data: p } = await supabase.from('posts').select('*').order('created_at', { ascending: false });

    setStaffs(s || []);
    setServices(sv || []);
    setPosts(p || []);
  }

  const handleFileUpload = async (event, type, id) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      if (type === 'staff') {
        setStaffs(staffs.map(s => s.id === id ? { ...s, photo_url: publicUrl } : s));
      } else if (type === 'post') {
        setEditingPost({ ...editingPost, thumbnail: publicUrl });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('이미지 업로드 중 오류가 발생했습니다. (버켓이 생성되어 있는지 확인해주세요)');
    } finally {
      setIsUploading(false);
    }
  };

  const saveTeam = async () => {
    try {
      for (const person of staffs) {
        const staffData = {
          name: person.name,
          position: person.position,
          photo_url: person.photo_url,
          highlights: person.highlights,
          sort_order: person.sort_order
        };
        if (person.id > 1000000000000) {
          await supabase.from('staff').insert(staffData);
        } else {
          await supabase.from('staff').update(staffData).eq('id', person.id);
        }
      }
      alert('운영자 정보가 저장되었습니다.');
      loadAllData();
    } catch (err) { console.error(err); alert('저장 중 오류 발생'); }
  };

  const saveServices = async () => {
    try {
      for (const service of services) {
        const serviceData = {
          name: service.name,
          description: service.description,
          sort_order: service.sort_order
        };
        if (service.id > 1000000000000) {
          await supabase.from('services').insert(serviceData);
        } else {
          await supabase.from('services').update(serviceData).eq('id', service.id);
        }
      }
      alert('업무 정보가 저장되었습니다.');
      loadAllData();
    } catch (err) { console.error(err); alert('저장 중 오류 발생'); }
  };

  const savePost = async () => {
    if (!editingPost.title || !editingPost.content) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }
    try {
      if (editingPost.id) {
        await supabase.from('posts').update(editingPost).eq('id', editingPost.id);
      } else {
        await supabase.from('posts').insert(editingPost);
      }
      alert('글이 저장되었습니다.');
      setEditingPost(null);
      loadAllData();
    } catch (err) { console.error(err); alert('저장 중 오류 발생'); }
  };

  const deleteItem = async (table, id) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      if (id < 1000000000000) {
        await supabase.from(table).delete().eq('id', id);
      }
      if (table === 'staff') setStaffs(staffs.filter(s => s.id !== id));
      if (table === 'services') setServices(services.filter(s => s.id !== id));
      if (table === 'posts') setPosts(posts.filter(p => p.id !== id));
    }
  };

  if (!isAuthorized) {
    return (
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <Lock size={48} color="#1e40af" />
        <h2 style={{ fontWeight: '800' }}>관리자 로그인</h2>
        <input type="password" value={inputPw} onChange={(e) => setInputPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkPassword()} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center', width: '250px', fontSize: '1.2rem' }} placeholder="비밀번호 입력" />
        <button onClick={checkPassword} style={{ padding: '12px 60px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '1.1rem' }}>인증하기</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px 100px' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
          <button onClick={() => setActiveTab('team')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'team' ? '#fff' : 'transparent', color: activeTab === 'team' ? '#1e40af' : '#64748b', fontWeight: '700', cursor: 'pointer', boxShadow: activeTab === 'team' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none' }}>운영자 관리</button>
          <button onClick={() => setActiveTab('services')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'services' ? '#fff' : 'transparent', color: activeTab === 'services' ? '#1e40af' : '#64748b', fontWeight: '700', cursor: 'pointer', boxShadow: activeTab === 'services' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none' }}>업무 관리</button>
          <button onClick={() => setActiveTab('info')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'info' ? '#fff' : 'transparent', color: activeTab === 'info' ? '#1e40af' : '#64748b', fontWeight: '700', cursor: 'pointer', boxShadow: activeTab === 'info' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none' }}>정보 광장 관리</button>
        </div>
      </header>

      {/* 1. 운영자 관리 */}
      {activeTab === 'team' && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}><Users /> 운영자 목록</h2>
            <button onClick={() => setStaffs([...staffs, { id: Date.now(), name: '', position: '', photo_url: '', highlights: [''], sort_order: staffs.length + 1 }])} style={{ padding: '10px 20px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={18} /> 운영자 추가</button>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            {staffs.map((person) => (
              <div key={person.id} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{ width: '120px', flexShrink: 0 }}>
                    <div style={{ width: '120px', height: '120px', backgroundColor: '#f8fafc', borderRadius: '12px', overflow: 'hidden', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {person.photo_url ? <img src={person.photo_url} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={32} color="#94a3b8" />}
                    </div>
                    <label style={{
                      marginTop: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '6px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: '600',
                      color: '#475569'
                    }}>
                      {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      사진 업로드
                      <input type="file" accept="image/*" hidden onChange={(e) => handleFileUpload(e, 'staff', person.id)} disabled={isUploading} />
                    </label>
                  </div>
                  <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input placeholder="이름" value={person.name} onChange={(e) => setStaffs(staffs.map(s => s.id === person.id ? { ...s, name: e.target.value } : s))} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '800' }} />
                    <input placeholder="역할 (예: 대표공인회계사)" value={person.position} onChange={(e) => setStaffs(staffs.map(s => s.id === person.id ? { ...s, position: e.target.value } : s))} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#2563eb', fontWeight: '600' }} />
                  </div>
                  <button onClick={() => deleteItem('staff', person.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}><X size={24} /></button>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: '#64748b' }}>주요 약력</h4>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {person.highlights?.map((h, hIdx) => (
                      <div key={hIdx} style={{ display: 'flex', gap: '8px' }}>
                        <input value={h} onChange={(e) => {
                          const newHighlights = [...person.highlights];
                          newHighlights[hIdx] = e.target.value;
                          setStaffs(staffs.map(s => s.id === person.id ? { ...s, highlights: newHighlights } : s));
                        }} style={{ flex: 1, padding: '8px', border: '1px solid #f1f5f9', borderRadius: '6px', fontSize: '0.9rem' }} />
                        <button onClick={() => {
                          const newHighlights = person.highlights.filter((_, i) => i !== hIdx);
                          setStaffs(staffs.map(s => s.id === person.id ? { ...s, highlights: newHighlights } : s));
                        }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><Trash2 size={16} /></button>
                      </div>
                    ))}
                    <button onClick={() => setStaffs(staffs.map(s => s.id === person.id ? { ...s, highlights: [...(s.highlights || []), ''] } : s))} style={{ width: 'fit-content', border: 'none', background: 'none', color: '#2563eb', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', padding: 0 }}>+ 행 추가</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
            <button onClick={saveTeam} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 60px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(30, 64, 175, 0.3)', cursor: 'pointer' }}>
              <Save size={22} /> 운영자 설정 저장하기
            </button>
          </div>
        </section>
      )}

      {/* 2. 업무 관리 */}
      {activeTab === 'services' && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}><Briefcase /> 업무 목록</h2>
            <button onClick={() => setServices([...services, { id: Date.now(), name: '', description: [''], sort_order: services.length + 1 }])} style={{ padding: '10px 20px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={18} /> 업무 추가</button>
          </div>
          <div style={{ display: 'grid', gap: '20px' }}>
            {services.map((service) => (
              <div key={service.id} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <input placeholder="업무명" value={service.name} onChange={(e) => setServices(services.map(s => s.id === service.id ? { ...s, name: e.target.value } : s))} style={{ flex: 1, padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '800', fontSize: '1.1rem' }} />
                  <button onClick={() => deleteItem('services', service.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '10px' }}><Trash2 size={24} /></button>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: '#64748b' }}>업무 상세 설명</h4>
                  {service.description?.map((line, lIdx) => (
                    <div key={lIdx} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                      <input value={line} onChange={(e) => {
                        const newDesc = [...service.description];
                        newDesc[lIdx] = e.target.value;
                        setServices(services.map(s => s.id === service.id ? { ...s, description: newDesc } : s));
                      }} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem' }} />
                      <button onClick={() => {
                        const newDesc = service.description.filter((_, i) => i !== lIdx);
                        setServices(services.map(s => s.id === service.id ? { ...s, description: newDesc } : s));
                      }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><Trash2 size={18} /></button>
                    </div>
                  ))}
                  <button onClick={() => setServices(services.map(s => s.id === service.id ? { ...s, description: [...(s.description || []), ''] } : s))} style={{ border: 'none', background: 'none', color: '#2563eb', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}>+ 설명 행 추가</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
            <button onClick={saveServices} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 60px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(30, 64, 175, 0.3)', cursor: 'pointer' }}>
              <Save size={22} /> 업무 설정 저장하기
            </button>
          </div>
        </section>
      )}

      {/* 3. 정보 광장 관리 */}
      {activeTab === 'info' && (
        <section>
          {!editingPost ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}><Info /> 정보 광장 게시글</h2>
                <button onClick={() => setEditingPost({ title: '', category: 'accounting', content: '', summary: '', thumbnail: '' })} style={{ padding: '10px 20px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={18} /> 새 글 쓰기</button>
              </div>
              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                {posts.map((post) => (
                  <div key={post.id} style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2563eb', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '4px', marginRight: '10px' }}>
                        {CATEGORIES.find(c => c.id === post.category)?.name}
                      </span>
                      <span style={{ fontWeight: '700', color: '#111827' }}>{post.title}</span>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8', marginLeft: '15px' }}>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => setEditingPost(post)} style={{ padding: '6px 15px', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer', backgroundColor: '#fff' }}>수정</button>
                      <button onClick={() => deleteItem('posts', post.id)} style={{ padding: '6px 15px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: '#fef2f2', color: '#ef4444' }}>삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '30px', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
              <button onClick={() => setEditingPost(null)} style={{ marginBottom: '20px', border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>← 목록으로 돌아가기</button>
              <div style={{ display: 'grid', gap: '20px', maxWidth: '100%' }}>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <select
                    value={editingPost.category}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                    style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', flex: '0 0 auto' }}
                  >
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input placeholder="글 제목을 입력하세요" value={editingPost.title} onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })} style={{ flex: 1, minWidth: '200px', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '800', fontSize: '1.2rem' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input placeholder="썸네일 이미지 URL" value={editingPost.thumbnail || ''} onChange={(e) => setEditingPost({ ...editingPost, thumbnail: e.target.value })} style={{ flex: 1, minWidth: '200px', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                  <label style={{
                    padding: '12px 20px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                    업로드
                    <input type="file" accept="image/*" hidden onChange={(e) => handleFileUpload(e, 'post')} disabled={isUploading} />
                  </label>
                </div>
                <textarea placeholder="요약 설명 (목록에서 보여집니다)" value={editingPost.summary || ''} onChange={(e) => setEditingPost({ ...editingPost, summary: e.target.value })} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', minHeight: '80px' }} />
                <div style={{ height: '500px', marginBottom: '50px' }}>
                  <ReactQuill
                    theme="snow"
                    value={editingPost.content}
                    onChange={(content) => setEditingPost({ ...editingPost, content })}
                    style={{ height: '400px' }}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                        ['link', 'image'],
                        [{ 'color': [] }, { 'background': [] }],
                        ['clean']
                      ],
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                  <button onClick={() => setEditingPost(null)} style={{ padding: '15px 40px', backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>취소</button>
                  <button onClick={savePost} style={{ padding: '15px 60px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)' }}>게시글 저장하기</button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Global CSS for Quill */}
      <style jsx global>{`
        .ql-container { font-size: 1.1rem; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; }
        .ql-toolbar { border-top-left-radius: 8px; border-top-right-radius: 8px; background-color: #f8fafc; }
        .ql-editor { min-height: 300px; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
