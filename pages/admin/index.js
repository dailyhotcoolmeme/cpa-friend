import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, Save, Plus, Trash2, Palette, Type, Briefcase, Calendar } from 'lucide-react';

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
      alert('저장되었습니다!');
      loadAllData();
    } catch (err) { alert('오류 발생'); }
  };

  // 컬러 피커와 텍스트 입력을 동시에 제공 (DB값 완벽 연동)
  const renderDesignSetting = (label, k, type = "number") => {
    const val = design[k] || (type === "color" ? "#000000" : "16");
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.85rem', width: '120px', color: '#475569', flexShrink: 0 }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <input 
            type={type} 
            value={val} 
            onChange={(e) => setDesign({ ...design, [k]: e.target.value })} 
            style={{ 
              width: type === "color" ? '45px' : '100%', 
              height: '35px', 
              padding: '2px', 
              border: '1px solid #cbd5e1', 
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          />
          {type === "color" ? (
            <input 
              type="text" 
              value={val} 
              onChange={(e) => setDesign({ ...design, [k]: e.target.value })}
              style={{ flex: 1, padding: '6px', fontSize: '0.8rem', border: '1px solid #e2e8f0', borderRadius: '4px', textTransform: 'uppercase' }}
            />
          ) : <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>pt</span>}
        </div>
      </div>
    );
  };

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
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '10px 10px 150px', backgroundColor: '#f8fafc', boxSizing: 'border-box' }}>
      
      <section style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 5px 15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>📦 사업 영역 내용 관리</h3>
          <button onClick={() => setBusinessAreas([...businessAreas, { id: Date.now(), title: '', content: [''] }])} style={{ padding: '6px 12px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.8rem' }}>+ 박스 추가</button>
        </div>

        {businessAreas.map(area => (
          <div key={area.id} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '15px', padding: '15px', marginBottom: '15px', position: 'relative', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center' }}>
              <input placeholder="사업1" value={area.title} onChange={(e) => setBusinessAreas(businessAreas.map(a => a.id === area.id ? {...a, title: e.target.value} : a))} style={{ flex: 1, fontWeight: 'bold', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', minWidth: 0 }} />
              <button onClick={() => setBusinessAreas(businessAreas.filter(a => a.id !== area.id))} style={{ color: '#ef4444', flexShrink: 0 }}><Trash2 size={22} /></button>
            </div>
            
            {area.content?.map((line, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                <input placeholder="상세 내용" value={line} onChange={(e) => {
                  const newContent = [...area.content]; newContent[idx] = e.target.value;
                  setBusinessAreas(businessAreas.map(a => a.id === area.id ? {...a, content: newContent} : a));
                }} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', minWidth: 0 }} />
                <button onClick={() => {
                  const newContent = area.content.filter((_, i) => i !== idx);
                  setBusinessAreas(businessAreas.map(a => a.id === area.id ? {...a, content: newContent} : a));
                }} style={{ color: '#94a3b8', flexShrink: 0 }}><Trash2 size={18} /></button>
              </div>
            ))}
            <button onClick={() => setBusinessAreas(businessAreas.map(a => a.id === area.id ? {...a, content: [...a.content, '']} : a))} style={{ fontSize: '0.8rem', color: '#2563eb', padding: '5px 0' }}>+ 줄 추가</button>
          </div>
        ))}
        
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#1e293b' }}>🎨 사업영역 스타일 세트</h4>
          {renderDesignSetting("헤드라인 크기/색상", "biz_head_size")}
          {renderDesignSetting("", "biz_head_color", "color")}
          {renderDesignSetting("박스 제목 크기/색상", "biz_title_size")}
          {renderDesignSetting("", "biz_title_color", "color")}
          {renderDesignSetting("상세 내용 크기/색상", "biz_content_size")}
          {renderDesignSetting("", "biz_content_color", "color")}
        </div>
      </section>

      <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', padding: '20px', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', zIndex: 1000, borderTop: '1px solid #e2e8f0' }}>
        <button onClick={saveAllChanges} style={{ width: '100%', padding: '16px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <Save size={20} /> 모든 설정 저장하기
        </button>
      </div>
    </div>
  );
}
