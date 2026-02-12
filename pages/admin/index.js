import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, Save, Plus, Trash2, Palette, Type, Briefcase, Calendar, Settings } from 'lucide-react';

export default function AdminHome() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inputPw, setInputPw] = useState('');
  const [businessAreas, setBusinessAreas] = useState([]);
  const [history, setHistory] = useState([]);
  const [design, setDesign] = useState({});

  async function checkPassword() {
    const { data } = await supabase.from('admin_config').select('value').eq('key', 'admin_password').single();
    if (data && data.value === inputPw) {
      setIsAuthorized(true);
      loadAllData();
    } else { alert('비밀번호가 틀렸습니다.'); }
  }

  async function loadAllData() {
    const { data: b } = await supabase.from('business_areas').select('*').order('sort_order');
    const { data: h } = await supabase.from('history').select('*').order('event_date', { ascending: false });
    const { data: d } = await supabase.from('site_design').select('*');
    setBusinessAreas(b || []);
    setHistory(h || []);
    const designObj = {};
    d?.forEach(item => { designObj[item.key] = item.value; });
    setDesign(designObj);
  }

  const saveAllChanges = async () => {
    try {
      for (const area of businessAreas) {
        if (typeof area.id === 'number' && area.id > 1000000000000) {
           await supabase.from('business_areas').insert({ title: area.title, content: area.content });
        } else {
           await supabase.from('business_areas').update({ title: area.title, content: area.content }).eq('id', area.id);
        }
      }
      for (const h of history) {
        if (typeof h.id === 'number' && h.id > 1000000000000) {
           await supabase.from('history').insert({ event_date: h.event_date, title: h.title, description: h.description });
        } else {
           await supabase.from('history').update({ event_date: h.event_date, title: h.title, description: h.description }).eq('id', h.id);
        }
      }
      const designEntries = Object.entries(design).map(([key, value]) => ({ key, value }));
      await supabase.from('site_design').upsert(designEntries);
      alert('모든 설정이 저장되었습니다!');
      loadAllData();
    } catch (err) { alert('저장 중 오류 발생'); }
  };

  const renderDesignSetting = (label, k, type = "number") => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
      <span style={{ fontSize: '0.85rem', width: '130px', color: '#475569' }}>{label}</span>
      {type === "number" ? <Type size={14} color="#94a3b8" /> : <Palette size={14} color="#94a3b8" />}
      <input 
        type={type} 
        value={design[k] || (type === "color" ? "#000000" : "16")} 
        onChange={(e) => setDesign({ ...design, [k]: e.target.value })} 
        style={{ width: type === "number" ? '60px' : '45px', height: '30px', padding: '2px', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
      />
      {type === "number" && <span style={{ fontSize: '0.75rem' }}>pt</span>}
    </div>
  );

  if (!isAuthorized) {
    return (
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <Lock size={48} color="#1e40af" />
        <h2>관리자 페이지 접속</h2>
        <input type="password" value={inputPw} onChange={(e) => setInputPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkPassword()} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }} />
        <button onClick={checkPassword} style={{ padding: '10px 30px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>인증하기</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 20px 150px', backgroundColor: '#fdfdfd' }}>
      
      {/* 1. 사업 영역 내용 관리 */}
      <section style={{ marginBottom: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={20} /> 사업 영역 내용 관리</h3>
          <button onClick={() => setBusinessAreas([...businessAreas, { id: Date.now(), title: '새 사업명', content: ['내용'] }])} style={{ padding: '8px 15px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#fff', fontSize: '0.85rem' }}>+ 박스 추가</button>
        </div>
        {businessAreas.map(area => (
          <div key={area.id} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', marginBottom: '15px', position: 'relative' }}>
            <button onClick={() => setBusinessAreas(businessAreas.filter(a => a.id !== area.id))} style={{ position: 'absolute', top: '15px', right: '15px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
            <div style={{ marginBottom: '10px', width: '90%' }}>
              <input value={area.title} onChange={(e) => setBusinessAreas(businessAreas.map(a => a.id === area.id ? {...a, title: e.target.value} : a))} style={{ width: '100%', fontWeight: 'bold', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
            </div>
            {area.content?.map((line, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input style={{ flex: 1, padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.9rem' }} value={line} onChange={(e) => {
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
        {/* 디자인 세트 (사업영역) */}
        <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px dashed #cbd5e1', marginTop: '10px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#64748b' }}>🎨 사업영역 스타일 세트</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '5px' }}>
            {renderDesignSetting("헤드라인 크기/색상", "biz_head_size")}
            {renderDesignSetting("", "biz_head_color", "color")}
            {renderDesignSetting("박스 제목 크기/색상", "biz_title_size")}
            {renderDesignSetting("", "biz_title_color", "color")}
            {renderDesignSetting("상세 내용 크기/색상", "biz_content_size")}
            {renderDesignSetting("", "biz_content_color", "color")}
          </div>
        </div>
      </section>

      <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #e2e8f0' }} />

      {/* 3. 회사 연혁 내용 관리 */}
      <section style={{ marginBottom: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={20} /> 회사 연혁 내용 관리</h3>
          <button onClick={() => setHistory([{ id: Date.now(), event_date: '2026.01', title: '새 연혁', description: '내용' }, ...history])} style={{ padding: '8px 15px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#fff', fontSize: '0.85rem' }}>+ 연혁 추가</button>
        </div>
        {history.map(h => (
          <div key={h.id} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', marginBottom: '12px', position: 'relative' }}>
            <button onClick={() => setHistory(history.filter(item => item.id !== h.id))} style={{ position: 'absolute', top: '15px', right: '15px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', width: '90%' }}>
              <input style={{ width: '80px', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center', fontSize: '0.9rem' }} value={h.event_date} onChange={(e) => setHistory(history.map(item => item.id === h.id ? {...item, event_date: e.target.value} : item))} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
              <input style={{ flex: 1, fontWeight: 'bold', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.9rem' }} value={h.title} onChange={(e) => setHistory(history.map(item => item.id === h.id ? {...item, title: e.target.value} : item))} />
            </div>
            <textarea style={{ width: '100%', padding: '8px', fontSize: '0.85rem', border: '1px solid #e2e8f0', borderRadius: '4px', minHeight: '60px' }} value={h.description || ''} onChange={(e) => setHistory(history.map(item => item.id === h.id ? {...item, description: e.target.value} : item))} />
          </div>
        ))}
        {/* 디자인 세트 (회사연혁) */}
        <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px dashed #cbd5e1', marginTop: '10px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#64748b' }}>🎨 회사연혁 스타일 세트</h4>
          {renderDesignSetting("헤드라인 크기/색상", "hist_head_size")}
          {renderDesignSetting("", "hist_head_color", "color")}
          {renderDesignSetting("왼쪽 날짜 크기/색상", "hist_date_size")}
          {renderDesignSetting("", "hist_date_color", "color")}
          {renderDesignSetting("우측 제목 크기/색상", "hist_title_size")}
          {renderDesignSetting("", "hist_title_color", "color")}
          {renderDesignSetting("우측 내용 크기/색상", "hist_desc_size")}
          {renderDesignSetting("", "hist_desc_color", "color")}
        </div>
      </section>

      {/* 5. 저장 버튼 (하단 고정) */}
      <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', padding: '15px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', zIndex: 1000 }}>
        <button onClick={saveAllChanges} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 20% ', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)', cursor: 'pointer' }}>
          <Save size={20} /> 설정 내용 한 번에 저장하기
        </button>
      </div>

    </div>
  );
}
