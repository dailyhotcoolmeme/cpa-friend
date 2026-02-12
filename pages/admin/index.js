import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, Save, Plus, Trash2, Palette, Type, Briefcase, Calendar, Settings } from 'lucide-react';

export default function AdminHome() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inputPw, setInputPw] = useState('');
  const [businessAreas, setBusinessAreas] = useState([]);
  const [history, setHistory] = useState([]);
  const [design, setDesign] = useState({});

  // ... (기존 checkPassword, loadAllData 로직 동일) ...

  const renderDesignSetting = (label, k, type = "number") => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
      <span style={{ fontSize: '0.85rem', width: '130px', color: '#475569' }}>{label}</span>
      {type === "number" ? <Type size={14} color="#94a3b8" /> : <Palette size={14} color="#94a3b8" />}
      <input 
        type={type} 
        value={design[k] || ''} 
        onChange={(e) => setDesign({ ...design, [k]: e.target.value })} 
        style={{ width: type === "number" ? '60px' : '45px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
      />
      {type === "number" && <span style={{ fontSize: '0.75rem' }}>pt</span>}
    </div>
  );

  if (!isAuthorized) { /* ... 기존 인증 UI ... */ }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 20px 150px', backgroundColor: '#fdfdfd' }}>
      
      {/* 1. 사업 영역 내용 관리 */}
      <section style={{ marginBottom: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={20} /> 사업 영역 내용 관리</h3>
          <button onClick={() => setBusinessAreas([...businessAreas, { id: Date.now(), title: '새 영역', content: ['첫 번째 내용'] }])} style={{ padding: '8px 15px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#fff' }}>+ 박스 추가</button>
        </div>
        {businessAreas.map(area => (
          <div key={area.id} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input value={area.title} onChange={(e) => setBusinessAreas(businessAreas.map(a => a.id === area.id ? {...a, title: e.target.value} : a))} style={{ flex: 1, fontWeight: 'bold', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              <button onClick={() => setBusinessAreas(businessAreas.filter(a => a.id !== area.id))} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={20} /></button>
            </div>
            {area.content?.map((line, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input style={{ flex: 1, padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px' }} value={line} onChange={(e) => {
                  const newContent = [...area.content]; newContent[idx] = e.target.value;
                  setBusinessAreas(businessAreas.map(a => a.id === area.id ? {...a, content: newContent} : a));
                }} />
                <button onClick={() => {
                  const newContent = area.content.filter((_, i) => i !== idx);
                  setBusinessAreas(businessAreas.map(a => a.id === area.id ? {...a, content: newContent} : a));
                }} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={16} color="#94a3b8" /></button>
              </div>
            ))}
            <button onClick={() => setBusinessAreas(businessAreas.map(a => a.id === area.id ? {...a, content: [...a.content, '']} : a))} style={{ fontSize: '0.8rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>+ 줄 추가</button>
          </div>
        ))}

        {/* 2. 사업 영역 디자인 세트 (내용 관리 바로 아래 배치) */}
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px dashed #cbd5e1', marginTop: '20px' }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#64748b' }}><Settings size={16} /> 사업영역 스타일 설정</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div>
              {renderDesignSetting("메인 헤드라인 크기", "biz_head_size")}
              {renderDesignSetting("메인 헤드라인 색상", "biz_head_color", "color")}
            </div>
            <div>
              {renderDesignSetting("박스 제목 크기", "biz_title_size")}
              {renderDesignSetting("박스 제목 색상", "biz_title_color", "color")}
            </div>
            <div>
              {renderDesignSetting("상세 내용 크기", "biz_content_size")}
              {renderDesignSetting("상세 내용 색상", "biz_content_color", "color")}
            </div>
          </div>
        </div>
      </section>

      <hr style={{ margin: '60px 0', border: '0', borderTop: '1px solid #e2e8f0' }} />

      {/* 3. 회사 연혁 내용 관리 */}
      <section style={{ marginBottom: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={20} /> 회사 연혁 내용 관리</h3>
          <button onClick={() => setHistory([{ id: Date.now(), event_date: '2026.01', title: '새 연혁', description: '내용' }, ...history])} style={{ padding: '8px 15px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#fff' }}>+ 연혁 추가</button>
        </div>
        {history.map(h => (
          <div key={h.id} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input style={{ width: '90px', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }} value={h.event_date} onChange={(e) => setHistory(history.map(item => item.id === h.id ? {...item, event_date: e.target.value} : item))} />
              <input style={{ flex: 1, fontWeight: 'bold', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={h.title} onChange={(e) => setHistory(history.map(item => item.id === h.id ? {...item, title: e.target.value} : item))} />
              <button onClick={() => setHistory(history.filter(item => item.id !== h.id))} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={20} /></button>
            </div>
          </div>
        ))}

        {/* 4. 회사 연혁 디자인 세트 (내용 관리 바로 아래 배치) */}
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px dashed #cbd5e1', marginTop: '20px' }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#64748b' }}><Settings size={16} /> 회사연혁 스타일 설정</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div>
              {renderDesignSetting("메인 헤드라인 크기", "hist_head_size")}
              {renderDesignSetting("메인 헤드라인 색상", "hist_head_color", "color")}
            </div>
            <div>
              {renderDesignSetting("왼쪽 날짜 크기", "hist_date_size")}
              {renderDesignSetting("왼쪽 날짜 색상", "hist_date_color", "color")}
            </div>
            <div>
              {renderDesignSetting("우측 제목 크기", "hist_title_size")}
              {renderDesignSetting("우측 제목 색상", "hist_title_color", "color")}
            </div>
          </div>
        </div>
      </section>

      {/* 5. 저장 버튼 (하단 고정바 형태) */}
      <div style={{ 
        position: 'fixed', bottom: '0', left: '0', right: '0', 
        backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
        padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', zIndex: 1000
      }}>
        <button onClick={saveAllChanges} style={{ 
          display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 60px', 
          backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '12px', 
          fontWeight: '800', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(30, 64, 175, 0.3)', cursor: 'pointer' 
        }}>
          <Save size={22} /> 설정 내용 한 번에 저장하기
        </button>
      </div>

    </div>
  );
}
