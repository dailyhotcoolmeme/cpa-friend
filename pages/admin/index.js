import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, List, Save, Eye, EyeOff, Plus, Trash2, ArrowUpDown } from 'lucide-react';

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

  // --- 사업 영역 관련 함수 ---
  async function addBusinessArea() {
    const newArea = { title: '새 사업 영역', content: ['내용을 입력하세요'], sort_order: businessAreas.length + 1 };
    const { data } = await supabase.from('business_areas').insert(newArea).select();
    if (data) setBusinessAreas([...businessAreas, data[0]]);
  }

  async function updateArea(id, field, value) {
    await supabase.from('business_areas').update({ [field]: value }).eq('id', id);
    setBusinessAreas(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  }

  // --- 연혁 관련 함수 ---
  async function addHistory() {
    const newEvent = { event_date: '2024.01', title: '내용 제목', description: '상세 설명' };
    const { data } = await supabase.from('history').insert(newEvent).select();
    if (data) loadHistory(historyOrder);
  }

  async function toggleHistoryOrder() {
    const newOrder = historyOrder === 'asc' ? 'desc' : 'asc';
    await supabase.from('admin_config').update({ value: newOrder }).eq('key', 'history_order');
    setHistoryOrder(newOrder);
    loadHistory(newOrder);
  }

  if (!isAuthorized) {
    return (
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <Lock size={48} color="#1e40af" />
        <h2>관리자 인증</h2>
        <input type="password" value={inputPw} onChange={(e) => setInputPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkPassword()} style={{ padding: '12px', textAlign: 'center' }} />
        <button onClick={checkPassword} style={{ padding: '10px 30px', backgroundColor: '#1e40af', color: '#fff', borderRadius: '8px' }}>접속</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', paddingBottom: '100px' }}>
      {/* 1. 메뉴 관리 (기존 유지) */}
      <section style={{ marginBottom: '50px' }}>
        <h3><List size={20} /> 메뉴 관리</h3>
        {menus.map(m => (
          <div key={m.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input type="text" defaultValue={m.name} onBlur={(e) => updateArea(m.id, 'name', e.target.value)} style={{ flex: 1, padding: '8px' }} />
          </div>
        ))}
      </section>

      {/* 2. 사업 영역 관리 */}
      <section style={{ marginBottom: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>사업 영역 (박스 구성)</h3>
          <button onClick={addBusinessArea} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Plus size={16} /> 추가</button>
        </div>
        {businessAreas.map(area => (
          <div key={area.id} style={{ border: '1px solid #ddd', padding: '20px', marginBottom: '15px', borderRadius: '10px' }}>
            <input 
              style={{ fontWeight: 'bold', fontSize: '1.1rem', width: '100%', marginBottom: '10px' }} 
              defaultValue={area.title} 
              onBlur={(e) => updateArea(area.id, 'title', e.target.value)} 
            />
            {area.content.map((line, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                <span>•</span>
                <input 
                  style={{ flex: 1 }} 
                  defaultValue={line} 
                  onBlur={(e) => {
                    const newContent = [...area.content];
                    newContent[idx] = e.target.value;
                    updateArea(area.id, 'content', newContent);
                  }} 
                />
                <button onClick={() => {
                  const newContent = area.content.filter((_, i) => i !== idx);
                  updateArea(area.id, 'content', newContent);
                }}><Trash2 size={14} /></button>
              </div>
            ))}
            <button onClick={() => updateArea(area.id, 'content', [...area.content, ''])} style={{ fontSize: '0.8rem' }}>+ 줄 추가</button>
          </div>
        ))}
      </section>

      {/* 3. 연혁 관리 */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>회사 연혁</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={toggleHistoryOrder}><ArrowUpDown size={16} /> {historyOrder === 'asc' ? '과거순' : '최신순'}</button>
            <button onClick={addHistory}><Plus size={16} /> 연혁 추가</button>
          </div>
        </div>
        {history.map(h => (
          <div key={h.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
            <input type="text" style={{ width: '80px' }} defaultValue={h.event_date} onBlur={(e) => updateArea(h.id, 'event_date', e.target.value)} />
            <input type="text" style={{ flex: 1 }} defaultValue={h.title} onBlur={(e) => updateArea(h.id, 'title', e.target.value)} />
            <button onClick={async () => { await supabase.from('history').delete().eq('id', h.id); loadHistory(historyOrder); }}><Trash2 size={16} /></button>
          </div>
        ))}
      </section>
    </div>
  );
}
