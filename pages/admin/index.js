import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, List, Save, Plus, Trash2, ArrowUpDown } from 'lucide-react';

export default function AdminHome() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inputPw, setInputPw] = useState('');
  const [menus, setMenus] = useState([]);
  const [businessAreas, setBusinessAreas] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyOrder, setHistoryOrder] = useState('desc');

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
    const { data: h_order } = await supabase.from('admin_config').select('value').eq('key', 'history_order').single();
    setMenus(m || []);
    setBusinessAreas(b || []);
    setHistoryOrder(h_order?.value || 'desc');
    loadHistory(h_order?.value || 'desc');
  }

  async function loadHistory(order) {
    const { data } = await supabase.from('history').select('*').order('event_date', { ascending: order === 'asc' });
    setHistory(data || []);
  }

  // 데이터베이스 업데이트 및 화면 실시간 반영 함수
  const updateTable = async (table, id, field, value) => {
    const { error } = await supabase.from(table).update({ [field]: value }).eq('id', id);
    if (!error) {
      if (table === 'business_areas') {
        setBusinessAreas(prev => prev.map(area => area.id === id ? { ...area, [field]: value } : area));
      }
      if (table === 'site_menu') {
        setMenus(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
      }
    }
  };

  if (!isAuthorized) {
    return (
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <Lock size={48} color="#1e40af" />
        <h2>관리자 인증</h2>
        <input type="password" value={inputPw} onChange={(e) => setInputPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkPassword()} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }} />
        <button onClick={checkPassword} style={{ padding: '10px 30px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>접속</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', paddingBottom: '100px' }}>
      {/* 1. 상단 메뉴 관리 */}
      <section style={{ marginBottom: '40px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '15px' }}>
        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><List size={20} /> 메뉴 명칭 관리</h3>
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '15px' }}>상단 탭에 표시될 이름을 수정합니다. 경로는 고정되어 있습니다.</p>
        {menus.map(m => (
          <div key={m.id} style={{ marginBottom: '10px', backgroundColor: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <input type="text" defaultValue={m.name} onBlur={(e) => updateTable('site_menu', m.id, 'name', e.target.value)} style={{ width: '100%', border: 'none', borderBottom: '1px solid #ddd', fontWeight: 'bold', fontSize: '1rem' }} />
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '5px' }}>연결된 경로: {m.path}</div>
          </div>
        ))}
      </section>

      {/* 2. 사업 영역 관리 */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>사업 영역 관리</h3>
          <button onClick={async () => {
            const { data } = await supabase.from('business_areas').insert({ title: '신규 사업 영역', content: ['내용을 입력하세요'], sort_order: businessAreas.length + 1 }).select();
            if (data) setBusinessAreas([...businessAreas, data[0]]);
          }} style={{ padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><Plus size={16} /> 박스 추가</button>
        </div>
        {businessAreas.map(area => (
          <div key={area.id} style={{ border: '1px solid #eee', padding: '20px', borderRadius: '12px', marginBottom: '20px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <input defaultValue={area.title} onBlur={(e) => updateTable('business_areas', area.id, 'title', e.target.value)} style={{ width: '100%', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '15px', border: 'none', borderBottom: '2px solid #1e40af', paddingBottom: '5px' }} />
            {area.content?.map((line, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#1e40af', paddingTop: '5px' }}>•</span>
                <input style={{ flex: 1, padding: '6px', border: '1px solid #f1f5f9', borderRadius: '4px' }} defaultValue={line} onBlur={(e) => {
                  const newContent = [...area.content];
                  newContent[idx] = e.target.value;
                  updateTable('business_areas', area.id, 'content', newContent);
                }} />
                <button onClick={() => {
                  const newContent = area.content.filter((_, i) => i !== idx);
                  updateTable('business_areas', area.id, 'content', newContent);
                }} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={16} color="#ef4444" /></button>
              </div>
            ))}
            <button onClick={() => {
              const newContent = [...(area.content || []), ''];
              updateTable('business_areas', area.id, 'content', newContent);
            }} style={{ marginTop: '10px', fontSize: '0.85rem', cursor: 'pointer', padding: '6px 12px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '6px', fontWeight: '600' }}>+ 줄 추가</button>
          </div>
        ))}
      </section>

      {/* 3. 회사 연혁 관리 */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>회사 연혁 관리</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={async () => {
              const newOrder = historyOrder === 'asc' ? 'desc' : 'asc';
              await updateTable('admin_config', 'history_order', 'value', newOrder);
              setHistoryOrder(newOrder); loadHistory(newOrder);
            }} style={{ cursor: 'pointer', padding: '5px 10px' }}><ArrowUpDown size={16} /> {historyOrder === 'asc' ? '과거순' : '최신순'}</button>
            <button onClick={async () => {
              const { data } = await supabase.from('history').insert({ event_date: '2026.01', title: '새로운 이벤트' }).select();
              if (data) loadHistory(historyOrder);
            }} style={{ cursor: 'pointer', padding: '5px 10px' }}><Plus size={16} /> 연혁 추가</button>
          </div>
        </div>
        {history.map(h => (
          <div key={h.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px', backgroundColor: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <input type="text" style={{ width: '85px', textAlign: 'center', border: '1px solid #eee', borderRadius: '4px' }} defaultValue={h.event_date} onBlur={(e) => updateTable('history', h.id, 'event_date', e.target.value)} />
            <input type="text" style={{ flex: 1, padding: '5px', border: 'none', borderBottom: '1px solid #eee' }} defaultValue={h.title} onBlur={(e) => updateTable('history', h.id, 'title', e.target.value)} />
            <button onClick={async () => { if(confirm('삭제할까요?')) { await supabase.from('history').delete().eq('id', h.id); loadHistory(historyOrder); } }} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={18} color="#ef4444" /></button>
          </div>
        ))}
      </section>
    </div>
  );
}
