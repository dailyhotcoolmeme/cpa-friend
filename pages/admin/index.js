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
      alert('모든 설정이 성공적으로 저장되었습니다!');
      loadAllData();
    } catch (err) { alert('저장 중 오류가 발생했습니다.'); }
  };

  const renderDesignSetting = (label, k, type = "number") => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
      <span style={{ fontSize: '0.85rem', width: '130px', color: '#475569' }}>{label}</span>
      <input 
        type={type} 
        // 핵심: 색상 값은 반드시 7자리 Hex(#000000) 형태여야 팔레트에 나옴
        value={design[k] || (type === "color" ? "#000000" : "16")} 
        onChange={(e) => setDesign({ ...design, [k]: e.target.value })} 
        style={{ 
          width: type === "number" ? '70px' : '50px', 
          height: '32px', 
          padding: type === "color" ? '2px' : '4px 8px', 
          border: '1px solid #cbd5e1', 
          borderRadius: '6px' 
        }}
      />
      {type === "number" && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>pt</span>}
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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 15px 150px', backgroundColor: '#fdfdfd', boxSizing: 'border-box' }}>
      
      {/* 1. 사업 영역 내용 관리 */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={20} /> 사업 영역 내용 관리</h3>
          <button onClick={() => setBusinessAreas([...businessAreas, { id: Date.now(), title: '', content: [''] }])} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #1e40af', color: '#1e40af', backgroundColor: '#fff', fontSize: '0.8rem', fontWeight: '600' }}>+ 박스 추가</button>
        </div>
        
        {businessAreas.map(area => (
          <div key={area.id} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', marginBottom: '15px', width: '100%', boxSizing: 'border-box' }}>
            {/* 제목과 휴지통을 한 라인에 (가로 사이즈 통일 핵심) */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
              <input 
                placeholder="사업 제목 (예: 사업1)"
                value={area.title} 
                onChange={(e) => setBusinessAreas(businessAreas.map(a => a.id === area.id ? {...a, title: e.target.value} : a))} 
                style={{ flex: 1, fontWeight: 'bold', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', width: '100%', boxSizing: 'border-box' }} 
              />
              <button onClick={() => setBusinessAreas(businessAreas.filter(a => a.id !== area.id))} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}><Trash2 size={20} /></button>
            </div>
            
            {/* 상세 내용 줄들 (가로 사이즈 통일) */}
            {area.content?.map((line, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                <input 
                  placeholder="내용 입력"
                  style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' }} 
                  value={line} 
                  onChange={(e) => {
                    const newContent = [...area.content]; newContent[idx] = e.target.value;
                    setBusinessAreas(businessAreas.map(a => a.id === area.id ? {...a, content: newContent} : a));
                  }} 
                />
                <button onClick={() => {
                  const newContent = area.content.filter((_, i) => i !== idx);
                  setBusinessAreas(businessAreas.map(a => a.id === area.id ? {...a, content: newContent} : a));
                }} style={{ border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0 }}><Trash2 size={18} color="#94a3b8" /></button>
              </div>
            ))}
            <button onClick={() => setBusinessAreas(businessAreas.map(a => a.id === area.id ? {...a, content: [...a.content, '']} : a))} style={{ fontSize: '0.8rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: '5px 0' }}>+ 줄 추가</button>
          </div>
        ))}

        <div style={{ backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '12px', marginTop: '10px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#475569' }}>🎨 사업영역 디자인 설정</h4>
          {renderDesignSetting("헤드라인 크기/색상", "biz_head_size")}
          {renderDesignSetting("", "biz_head_color", "color")}
          {renderDesignSetting("박스 제목 크기/색상", "biz_title_size")}
          {renderDesignSetting("", "biz_title_color", "color")}
          {renderDesignSetting("상세 내용 크기/색상", "biz_content_size")}
          {renderDesignSetting("", "biz_content_color", "color")}
        </div>
      </section>

      <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #e2e8f0' }} />

      {/* 2. 회사 연혁 내용 관리 */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={20} /> 회사 연혁 내용 관리</h3>
          <button onClick={() => setHistory([{ id: Date.now(), event_date: '', title: '', description: '' }, ...history])} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #1e40af', color: '#1e40af', backgroundColor: '#fff', fontSize: '0.8rem', fontWeight: '600' }}>+ 연혁 추가</button>
        </div>

        {history.map(h => (
          <div key={h.id} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', marginBottom: '15px', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
              <input placeholder="2026.02" style={{ width: '90px', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'center' }} value={h.event_date} onChange={(e) => setHistory(history.map(item => item.id === h.id ? {...item, event_date: e.target.value} : item))} />
              <input placeholder="연혁 제목" style={{ flex: 1, fontWeight: 'bold', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} value={h.title} onChange={(e) => setHistory(history.map(item => item.id === h.id ? {...item, title: e.target.value} : item))} />
              <button onClick={() => setHistory(history.filter(item => item.id !== h.id))} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}><Trash2 size={20} /></button>
            </div>
            <textarea placeholder="상세 내용 설명" style={{ width: '100%', padding: '10px', fontSize: '0.9rem', border: '1px solid #e2e8f0', borderRadius: '6px', minHeight: '60px', boxSizing: 'border-box' }} value={h.description || ''} onChange={(e) => setHistory(history.map(item => item.id === h.id ? {...item, description: e.target.value} : item))} />
          </div>
        ))}

        <div style={{ backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '12px', marginTop: '10px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#475569' }}>🎨 회사연혁 디자인 설정</h4>
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

      {/* 3. 하단 저장 버튼 */}
      <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', zIndex: 1000 }}>
        <button onClick={saveAllChanges} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '90%', maxWidth: '400px', justifyContent: 'center', padding: '15px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(30, 64, 175, 0.3)', cursor: 'pointer' }}>
          <Save size={22} /> 설정 내용 한 번에 저장하기
        </button>
      </div>

    </div>
  );
}