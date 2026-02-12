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

      alert('모든 변경사항이 저장되었습니다!');
      loadAllData();
    } catch (err) {
      console.error(err);
      alert('저장 중 오류가 발생했습니다.');
    }
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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 20px 150px', backgroundColor: '#fdfdfd' }}>

      {/* 회사 연혁 관리 */}
      <section style={{ marginBottom: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} /> 회사 연혁 내용 관리
          </h3>
          <button
            onClick={() => setHistory([{ id: Date.now(), event_date: '2026.01', title: '새 연혁', description: '내용' }, ...history])}
            style={{ padding: '8px 15px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#fff' }}
          >
            + 연혁 추가
          </button>
        </div>

        {history.map(h => (
          <div
            key={h.id}
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '15px',
              marginBottom: '15px'
            }}
          >

            {/* 🔥 수정된 부분 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px'
              }}
            >
              <input
                style={{
                  width: '80px',
                  padding: '6px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}
                value={h.event_date}
                onChange={(e) =>
                  setHistory(history.map(item =>
                    item.id === h.id ? { ...item, event_date: e.target.value } : item
                  ))
                }
              />

              <input
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontWeight: 'bold',
                  padding: '6px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px'
                }}
                value={h.title}
                onChange={(e) =>
                  setHistory(history.map(item =>
                    item.id === h.id ? { ...item, title: e.target.value } : item
                  ))
                }
              />

              <button
                onClick={() => setHistory(history.filter(item => item.id !== h.id))}
                style={{
                  flexShrink: 0,
                  padding: '6px',
                  borderRadius: '6px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={18} color="#ef4444" />
              </button>
            </div>

            <textarea
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '0.9rem',
                border: '1px solid #e2e8f0',
                borderRadius: '4px'
              }}
              value={h.description || ''}
              onChange={(e) =>
                setHistory(history.map(item =>
                  item.id === h.id ? { ...item, description: e.target.value } : item
                ))
              }
            />
          </div>
        ))}
      </section>

      {/* 저장 버튼 */}
      <div
        style={{
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          backgroundColor: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          padding: '20px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 1000
        }}
      >
        <button
          onClick={saveAllChanges}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '15px 60px',
            backgroundColor: '#1e40af',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '800',
            fontSize: '1.1rem',
            boxShadow: '0 4px 15px rgba(30, 64, 175, 0.3)',
            cursor: 'pointer'
          }}
        >
          <Save size={22} /> 설정 내용 한 번에 저장하기
        </button>
      </div>
    </div>
  );
}