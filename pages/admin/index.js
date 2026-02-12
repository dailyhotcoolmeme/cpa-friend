import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, Save, Plus, Trash2, Palette, Type } from 'lucide-react';

export default function AdminHome() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inputPw, setInputPw] = useState('');
  
  const [menus, setMenus] = useState([]);
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
    const { data: m } = await supabase.from('site_menu').select('*').order('sort_order');
    const { data: b } = await supabase.from('business_areas').select('*').order('sort_order');
    const { data: h } = await supabase.from('history').select('*').order('event_date', { ascending: false });
    const { data: d } = await supabase.from('site_design').select('*');
    
    setMenus(m || []);
    setBusinessAreas(b || []);
    setHistory(h || []);
    
    const designObj = {};
    d?.forEach(item => { designObj[item.key] = item.value; });
    setDesign(designObj);
  }

  const saveAllChanges = async () => {
    try {
      for (const m of menus) {
        await supabase.from('site_menu').update({ name: m.name }).eq('id', m.id);
      }
      for (const area of businessAreas) {
        await supabase.from('business_areas').update({ title: area.title, content: area.content }).eq('id', area.id);
      }
      for (const h of history) {
        await supabase.from('history').update({ event_date: h.event_date, title: h.title, description: h.description }).eq('id', h.id);
      }
      const designEntries = Object.entries(design).map(([key, value]) => ({ key, value }));
      await supabase.from('site_design').upsert(designEntries);

      alert('모든 변경사항이 저장되었습니다!');
    } catch (err) {
      console.error(err);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  if (!isAuthorized) {
    return (
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <Lock size={48} color="#1e40af" />
        <h2>관리자 인증</h2>
        <input type="password" value={inputPw} onChange={(e) => setInputPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkPassword()} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }} />
        <button onClick={checkPassword} style={{ padding: '10px 30px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>접속</button>
      </div>
    );
  }

  // 에러 방지를 위해 컴포넌트가 아닌 일반 헬퍼 함수로 정의
  const renderDesignInput = (label, k, type = "number") => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
      <span style={{ fontSize: '0.8rem', width: '100px' }}>{label}</span>
      {type === "number" ? <Type size={14} /> : <Palette size={14} />}
      <input 
        type={type} 
        value={design[k] || ''} 
        onChange={(e) => setDesign({ ...design, [k]: e.target.value })} 
        style={{ width: type === "number" ? '50px' : '40px', padding: '2px' }}
      />
      {type === "number" && <span style={{fontSize: '0.8rem'}}>pt</span>}
    </div>
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', paddingBottom: '100px', fontSize: '14px' }}>
      
      <div style={{ position: 'sticky', top: '20px', zIndex: 1000, display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button onClick={saveAllChanges} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '15px 40px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 'bold', boxShadow: '0 10px 15px rgba(37, 99, 235, 0.3)', cursor: 'pointer' }}>
          <Save size={20} /> 모든 내용 저장하기
        </button>
      </div>

      <section style={{ backgroundColor: '#eff6ff', padding: '25px', borderRadius: '20px', marginBottom: '40px', border: '1px solid #bfdbfe' }}>
        <h3 style={{ marginTop: 0, color: '#1e40af' }}>🎨 통합 디자인 설정</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <h4 style={{ borderBottom: '1px solid #bfdbfe', paddingBottom: '5px' }}>사업 영역 세트</h4>
            {renderDesignInput("헤드라인 크기", "biz_head_size")}
            {renderDesignInput("헤드라인 색상", "biz_head_color", "color")}
            {renderDesignInput("박스제목 크기", "biz_title_size")}
            {renderDesignInput("박스제목 색상", "biz_title_color", "color")}
            {renderDesignInput("상세내용 크기", "biz_content_size")}
            {renderDesignInput("상세내용 색상", "biz_content_color", "color")}
          </div>
          <div>
            <h4 style={{ borderBottom: '1px solid #bfdbfe', paddingBottom: '5px' }}>회사 연혁 세트</h4>
            {renderDesignInput("헤드라인 크기", "hist_head_size")}
            {renderDesignInput("헤드라인 색상", "hist_head_color", "color")}
            {renderDesignInput("날짜(왼쪽) 크기", "hist_date_size")}
            {renderDesignInput("날짜(왼쪽) 색상", "hist_date_color", "color")}
            {renderDesignInput("제목(오른쪽) 크기", "hist_title_size")}
            {renderDesignInput("제목(오른쪽) 색상", "hist_title_color", "color")}
            {renderDesignInput("내용(상세) 크기", "hist_desc_size")}
            {renderDesignInput("내용(상세) 색상", "hist_desc_color", "color")}
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h3>사업 영역 내용 관리</h3>
          <button onClick={() => setBusinessAreas([...businessAreas, { id: Date.now(), title: '신규', content: ['내용'] }])} style={{cursor: 'pointer'}}><Plus size={16} /> 박스 추가</button>
        </div>
        {businessAreas.map(area => (
          <div key={area.id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '12px', marginBottom: '15px', backgroundColor: '#fff' }}>
            <input value={area.title} onChange={(e) => setBusinessAreas(businessAreas.map(a => a.id === area.id ? {...a, title: e.target.value} : a))} style={{ width: '100%', fontWeight: 'bold', marginBottom: '10px', padding: '5px' }} />
            {area.content?.map((line, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                <input style={{ flex: 1, padding: '5px' }} value={line} onChange={(e) => {
                  const newContent = [...area.content]; newContent[idx] = e.target.value;
                  setBusinessAreas(businessAreas.map(a => a.id === area.id ? {...a, content: newContent} : a));
                }} />
                <button onClick={() => {
                  const newContent = area.content.filter((_, i) => i !== idx);
                  setBusinessAreas(businessAreas.map(a => a.id === area.id ? {...a, content: newContent} : a));
                }} style={{cursor: 'pointer'}}><Trash2 size={14} /></button>
              </div>
            ))}
            <button onClick={() => setBusinessAreas(businessAreas.map(a => a.id === area.id ? {...a, content: [...a.content, '']} : a))} style={{cursor: 'pointer', fontSize: '0.8rem', marginTop: '5px'}}>+ 줄 추가</button>
          </div>
        ))}
      </section>

      <section>
        <h3>회사 연혁 내용 관리</h3>
        {history.map(h => (
          <div key={h.id} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '10px', border: '1px solid #f1f5f9', marginBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
              <input style={{ width: '85px', textAlign: 'center', padding: '5px' }} value={h.event_date} onChange={(e) => setHistory(history.map(item => item.id === h.id ? {...item, event_date: e.target.value} : item))} />
              <input style={{ flex: 1, fontWeight: 'bold', padding: '5px' }} value={h.title} onChange={(e) => setHistory(history.map(item => item.id === h.id ? {...item, title: e.target.value} : item))} />
              <button onClick={() => { if(confirm('삭제할까요?')) setHistory(history.filter(item => item.id !== h.id)); }} style={{cursor: 'pointer'}}><Trash2 size={18} color="#ef4444" /></button>
            </div>
            <textarea style={{ width: '100%', padding: '8px', fontSize: '0.85rem', border: '1px solid #ddd' }} value={h.description || ''} onChange={(e) => setHistory(history.map(item => item.id === h.id ? {...item, description: e.target.value} : item))} />
          </div>
        ))}
        <button onClick={() => setHistory([{ id: Date.now(), event_date: '2026.01', title: '제목', description: '상세내용' }, ...history])} style={{cursor: 'pointer', padding: '10px', width: '100%', marginTop: '10px'}}>+ 연혁 추가</button>
      </section>
    </div>
  );
}
