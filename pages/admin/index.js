import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, Save, Plus, Trash2, Palette, Type, Briefcase, Calendar, Settings, List } from 'lucide-react';

export default function AdminHome() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inputPw, setInputPw] = useState('');
  const [businessAreas, setBusinessAreas] = useState([]);
  const [history, setHistory] = useState([]);
  const [design, setDesign] = useState({});
  const [menus, setMenus] = useState([]); // 기존 메뉴 리스트 상태

  // 비밀번호 확인 함수
  async function checkPassword() {
    const { data } = await supabase.from('admin_config').select('value').eq('key', 'admin_password').single();
    if (data && data.value === inputPw) {
      setIsAuthorized(true);
      loadAllData();
    } else { alert('비밀번호가 틀렸습니다.'); }
  }

  // 데이터 불러오기 함수
  async function loadAllData() {
    const { data: b } = await supabase.from('business_areas').select('*').order('sort_order');
    const { data: h } = await supabase.from('history').select('*').order('event_date', { ascending: false });
    const { data: d } = await supabase.from('site_design').select('*');
    const { data: m } = await supabase.from('menu_settings').select('*').order('id'); // 기존 메뉴들 가져오기
    
    setBusinessAreas(b || []);
    setHistory(h || []);
    setMenus(m || []); // 메뉴 리스트 바인딩
    
    const designObj = {};
    d?.forEach(item => { designObj[item.key] = item.value; });
    setDesign(designObj);
  }

  // 일괄 저장 함수
  const saveAllChanges = async () => {
    try {
      // 1. 메뉴 저장 및 업데이트
      for (const m of menus) {
        if (typeof m.id === 'number' && m.id > 1000000000000) {
          await supabase.from('menu_settings').insert({ name: m.name, link: m.link });
        } else {
          await supabase.from('menu_settings').update({ name: m.name, link: m.link }).eq('id', m.id);
        }
      }

      // 2. 사업 영역 저장
      for (const area of businessAreas) {
        if (typeof area.id === 'number' && area.id > 1000000000000) {
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

      alert('모든 변경사항이 저장되었습니다!');
      loadAllData();
    } catch (err) {
      console.error(err);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // 메뉴 삭제 함수 (DB 연동)
  const handleDeleteMenu = async (id) => {
    if (typeof id === 'number' && id > 1000000000000) {
      // 새로 추가했다가 저장 전인 항목은 로컬에서만 삭제
      setMenus(menus.filter(m => m.id !== id));
    } else {
      // 이미 DB에 있는 항목은 진짜 삭제
      if (confirm('메뉴를 삭제하시겠습니까?')) {
        const { error } = await supabase.from('menu_settings').delete().eq('id', id);
        if (!error) loadAllData();
      }
    }
  };

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
      
      {/* 0. 메뉴 리스트 및 관리 섹션 */}
      <section style={{ marginBottom: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><List size={20} /> 메뉴 구성 관리</h3>
          <button onClick={() => setMenus([...menus, { id: Date.now(), name: '', link: '/' }])} style={{ padding: '8px 15px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#fff' }}>+ 메뉴 추가</button>
        </div>
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          {menus.length === 0 && <p style={{ fontSize: '0.9rem', color: '#94a3b8', textAlign: 'center' }}>등록된 메뉴가 없습니다.</p>}
          {menus.map(menu => (
            <div key={menu.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input placeholder="메뉴 이름" value={menu.name} onChange={(e) => setMenus(menus.map(m => m.id === menu.id ? {...m, name: e.target.value} : m))} style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              <input placeholder="이동 경로 (/about)" value={menu.link} onChange={(e) => setMenus(menus.map(m => m.id === menu.id ? {...m, link: e.target.value} : m))} style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              <button onClick={() => handleDeleteMenu(menu.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={20} /></button>
            </div>
          ))}
        </div>
      </section>

      <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #e2e8f0' }} />

      {/* 1. 사업 영역 내용 관리 */}
      <section style={{ marginBottom: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={20} /> 사업 영역 내용 관리</h3>
          <button onClick={() => setBusinessAreas([...businessAreas, { id: Date.now(), title: '새 영역', content: ['내용 작성'] }])} style={{ padding: '8px 15px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#fff' }}>+ 박스 추가</button>
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
        {/* ... (이하 사업영역/연혁 스타일 설정 및 연혁 관리는 베이스 코드와 동일) ... */}
        
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

      {/* 2. 회사 연혁 내용 관리 */}
      <section style={{ marginBottom: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={20} /> 회사 연혁 내용 관리</h3>
          <button onClick={() => setHistory([{ id: Date.now(), event_date: '2026.01', title: '새 연혁', description: '내용' }, ...history])} style={{ padding: '8px 15px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#fff' }}>+ 연혁 추가</button>
        </div>
        {history.map(h => (
          <div key={h.id} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input style={{ width: '90px', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }} value={h.event_date} onChange={(e) => setHistory(history.map(item => item.id === h.id ? {...item, event_date: e.target.value} : item))} />
              <input style={{ flex: 1, fontWeight: 'bold', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={h.title} onChange={(e) => setHistory(history.map(item => item.id === h.id ? {...item, title: e.target.value} : item))} />
              <button onClick={() => setHistory(history.filter(item => item.id !== h.id))} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={20} /></button>
            </div>
            <textarea style={{ width: '100%', padding: '8px', fontSize: '0.9rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} value={h.description || ''} onChange={(e) => setHistory(history.map(item => item.id === h.id ? {...item, description: e.target.value} : item))} />
          </div>
        ))}
        {/* ... (연혁 디자인 설정 부분) ... */}
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
              <div style={{marginTop:'5px'}} />
              {renderDesignSetting("우측 상세내용 크기", "hist_desc_size")}
              {renderDesignSetting("우측 상세내용 색상", "hist_desc_color", "color")}
            </div>
          </div>
        </div>
      </section>

      {/* 5. 저장 버튼 (하단 고정) */}
      <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', zIndex: 1000 }}>
        <button onClick={saveAllChanges} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 60px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(30, 64, 175, 0.3)', cursor: 'pointer' }}>
          <Save size={22} /> 설정 내용 한 번에 저장하기
        </button>
      </div>
    </div>
  );
}
