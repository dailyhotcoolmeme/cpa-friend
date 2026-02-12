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

  // ★ 핵심: 모든 내용을 한 번에 저장하는 함수
  const saveAllChanges = async () => {
    try {
      // 1. 메뉴명 저장
      for (const m of menus) {
        await supabase.from('site_menu').update({ name: m.name }).eq('id', m.id);
      }
      // 2. 사업 영역 저장 (박스 추가/삭제 대응을 위해 기존 데이터 정리 후 삽입하거나 update)
      for (const area of businessAreas) {
        if (typeof area.id === 'number' && area.id > 1000000000000) { // 신규 아이템 (Date.now())
           await supabase.from('business_areas').insert({ title: area.title, content: area.content });
        } else {
           await supabase.from('business_areas').update({ title: area.title, content: area.content }).eq('id', area.id);
        }
      }
      // 3. 회사 연혁 저장
      for (const h of history) {
        if (typeof h.id === 'number' && h.id > 1000000000000) {
           await supabase.from('history').insert({ event_date: h.event_date, title: h.title, description: h.description });
        } else {
           await supabase.from('history').update({ event_date: h.event_date, title: h.title, description: h.description }).eq('id', h.id);
        }
      }
      // 4. 통합 디자인 설정 저장
      const designEntries = Object.entries(design).map(([key, value]) => ({ key, value }));
      await supabase.from('site_design').upsert(designEntries);

      alert('디자인과 텍스트가 모두 일괄 저장되었습니다!');
      loadAllData(); // 데이터 새로고침
    } catch (err) {
      console.error(err);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // 디자인 입력 필드 렌더링 함수 (빌드 에러 방지를 위해 render 밖이 아닌 내부 헬퍼로 사용)
  const renderDesignSetting = (label, k, type = "number") => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
      <span style={{ fontSize: '0.85rem', width: '120px', color: '#475569' }}>{label}</span>
      {type === "number" ? <Type size={14} color="#94a3b8" /> : <Palette size={14} color="#94a3b8" />}
      <input 
        type={type} 
        value={design[k] || ''} 
        onChange={(e) => setDesign({ ...design, [k]: e.target.value })} 
        style={{ 
          width: type === "number" ? '60px' : '45px', 
          padding: '4px', 
          border: '1px solid #cbd5e1', 
          borderRadius: '4px' 
        }}
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
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', paddingBottom: '100px', backgroundColor: '#fdfdfd' }}>
      
      {/* 둥둥 떠있는 일괄 저장 버튼 */}
      <div style={{ position: 'sticky', top: '20px', zIndex: 1000, display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
        <button onClick={saveAllChanges} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '18px 50px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: '800', fontSize: '1.1rem', boxShadow: '0 10px 25px rgba(30, 64, 175, 0.4)', cursor: 'pointer' }}>
          <Save size={24} /> 모든 변경사항 한 번에 저장하기
        </button>
      </div>

      {/* 디자인 세트 설정 구역 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
        <section style={{ backgroundColor: '#f1f5f9', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ borderBottom: '2px solid #334155', paddingBottom: '10px', color: '#1e293b' }}>🏢 사업영역 디자인 세트</h3>
          {renderDesignSetting("메인 헤드라인 크기", "biz_head_size")}
          {renderDesignSetting("메인 헤드라인 색상", "biz_head_color", "color")}
          <div style={{ height: '15px' }} />
          {renderDesignSetting("박스 제목 크기", "biz_title_size")}
          {renderDesignSetting("박스 제목 색상", "biz_title_color", "color")}
          <div style={{ height: '15px' }} />
          {renderDesignSetting("상세 내용 크기", "biz_content_size")}
          {renderDesignSetting("상세 내용 색상", "biz_content_color", "color")}
        </section>

        <section style={{ backgroundColor: '#f1f5f9', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ borderBottom: '2px solid #334155', paddingBottom: '10px', color: '#1e293b' }}>📅 회사연혁 디자인 세트</h3>
          {renderDesignSetting("메인 헤드라인 크기", "hist_head_size")}
          {renderDesignSetting("메인 헤드라인 색상", "hist_head_color", "color")}
          <div style={{ height: '15px' }} />
          {renderDesignSetting("왼쪽 날짜 크기", "hist_date_size")}
          {renderDesignSetting("왼쪽 날짜 색상", "hist_date_color", "color")}
          <div style={{ height: '15px' }} />
          {renderDesignSetting("우측 제목 크기", "hist_title_size")}
          {renderDesignSetting("우측 제목 색상", "hist_title_color", "color")}
          <div style={{ height: '15px' }} />
          {renderDesignSetting("우측 상세내용 크기", "hist_desc_size")}
          {renderDesignSetting("우측 상세내용 색상", "hist_desc_color", "color")}
        </section>
      </div>

      <hr style={{ margin: '40px 0', border: '0.5px solid #eee' }} />

      {/* 내용 관리 파트 (사업영역) */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>📦 사업 영역 내용 관리</h3>
          <button onClick={() => setBusinessAreas([...businessAreas, { id: Date.now(), title: '새 영역', content: ['첫 번째 내용'] }])} style={{ padding: '8px 15px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#fff' }}>+ 박스 추가</button>
        </div>
        {businessAreas.map(area => (
          <div key={area.id} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input value={area.title} onChange={(e) => setBusinessAreas(businessAreas.map(a => a.id === area.id ? {...a, title: e.target.value} : a))} style={{ flex: 1, fontWeight: 'bold', fontSize: '1.1rem', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              <button onClick={async () => { if(confirm('이 영역을 삭제할까요?')) { await supabase.from('business_areas').delete().eq('id', area.id); setBusinessAreas(businessAreas.filter(a => a.id !== area.id)); }}} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={20} /></button>
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
      </section>

      {/* 내용 관리 파트 (회사연혁) */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>📜 회사 연혁 내용 관리</h3>
          <button onClick={() => setHistory([{ id: Date.now(), event_date: '2026.01', title: '새 연혁', description: '상세 내용' }, ...history])} style={{ padding: '8px 15px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#fff' }}>+ 연혁 추가</button>
        </div>
        {history.map(h => (
          <div key={h.id} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input style={{ width: '90px', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }} value={h.event_date} onChange={(e) => setHistory(history.map(item => item.id === h.id ? {...item, event_date: e.target.value} : item))} />
              <input style={{ flex: 1, fontWeight: 'bold', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={h.title} onChange={(e) => setHistory(history.map(item => item.id === h.id ? {...item, title: e.target.value} : item))} />
              <button onClick={async () => { if(confirm('삭제?')) { await supabase.from('history').delete().eq('id', h.id); setHistory(history.filter(item => item.id !== h.id)); }}} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={20} /></button>
            </div>
            <textarea style={{ width: '100%', padding: '8px', fontSize: '0.9rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} value={h.description || ''} onChange={(e) => setHistory(history.map(item => item.id === h.id ? {...item, description: e.target.value} : item))} />
          </div>
        ))}
      </section>
    </div>
  );
}
