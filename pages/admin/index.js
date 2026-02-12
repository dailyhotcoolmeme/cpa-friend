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

  const updateTable = async (table, id, field, value) => {
    await supabase.from(table).update({ [field]: value }).eq('id', id);
  };

  if (!isAuthorized) {
    return (
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <Lock size={48} color="#1e40af" />
        <h2>관리자 인증</h2>
        <input type="password" value={inputPw} onChange={(e) => setInputPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkPassword()} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
        <button onClick={checkPassword} style={{ padding: '10px 30px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px' }}>접속</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', paddingBottom: '100px' }}>
      {/* 1. 상단 메뉴 관리 (이름만) */}
      <section style={{ marginBottom: '40px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '15px' }}>
        <h3 style={{ marginTop: 0 }}><List size={20} /> 메뉴 명칭 관리</h3>
        {menus.map(m => (
          <div key={m.id} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#fff', padding: '10px', borderRadius: '8px' }}>
            <div style={{ flex: 1 }}>
              <input type="text" defaultValue={m.name} onBlur={(e) => updateTable('site_menu', m.id, 'name', e.target.value)} style={{ width: '100%', border: 'none', borderBottom: '1px solid #ddd', fontWeight: 'bold' }} />
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>연결 주소: {m.path}</div>
            </div>
          </div>
        ))}
      </section>

      {/* 2. 사업 영역 관리 */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>사업 영역 (박스)</h3>
          <button onClick={async () => {
            const { data } = await supabase.from('business_areas').insert({ title: '신규 사업', content: ['내용 입력'], sort_order: businessAreas.length + 1 }).select();
            if (data) setBusinessAreas([...businessAreas, data[0]]);
          }}><Plus size={16} /> 추가</button>
        </div>
        {businessAreas.map(area => (
          <div key={area.id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
            <input defaultValue={area.title} onBlur={(e) => updateTable('business_areas', area.id, 'title', e.target.value)} style={{ width: '100%', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '10px' }} />
            {area.content?.map((line, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                <input style={{ flex: 1 }} defaultValue={line} onBlur={(e) => {
                  const newContent = [...area.content]; newContent[idx] = e.target.value;
                  updateTable('business_areas', area.id, 'content', newContent);
                }} />
                <button onClick={() => {
                  const newContent = area.content.filter((_, i) => i !== idx);
                  updateTable('business_areas', area.id, 'content', newContent);
                }}><Trash2 size={14} /></button>
              </div>
            ))}
            <button onClick={() => updateTable('business_areas', area.id, 'content', [...area.content, ''])} style={{ fontSize: '0.8rem' }}>+ 줄 추가</button>
          </div>
        ))}
      </section>

      {/* 3. 연혁 관리 */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>회사 연혁</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={async () => {
              const newOrder = historyOrder === 'asc' ? 'desc' : 'asc';
              await updateTable('admin_config', 'history_order', 'value', newOrder);
              setHistoryOrder(newOrder); loadHistory(newOrder);
            }}><ArrowUpDown size={16} /> {historyOrder === 'asc' ? '과거순' : '최신순'}</button>
            <button onClick={async () => {
              const { data } = await supabase.from('history').insert({ event_date: '2026.01', title: '내용' }).select();
              if (data) loadHistory(historyOrder);
            }}><Plus size={16} /> 추가</button>
          </div>
        </div>
        {history.map(h => (
          <div key={h.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input type="text" style={{ width: '80px' }} defaultValue={h.event_date} onBlur={(e) => updateTable('history', h.id, 'event_date', e.target.value)} />
            <input type="text" style={{ flex: 1 }} defaultValue={h.title} onBlur={(e) => updateTable('history', h.id, 'title', e.target.value)} />
            <button onClick={async () => { await supabase.from('history').delete().eq('id', h.id); loadHistory(historyOrder); }}><Trash2 size={16} /></button>
          </div>
        ))}
      </section>
    </div>
  );
}
