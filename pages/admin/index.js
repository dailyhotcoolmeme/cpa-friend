import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, List, Save, Plus, Trash2, ArrowUpDown, Check } from 'lucide-react';

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

  // 저장 버튼 전용 함수
  const saveData = async (table, item) => {
    const { error } = await supabase.from(table).update(item).eq('id', item.id);
    if (!error) alert('저장되었습니다.');
  };

  if (!isAuthorized) {
    return (
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <Lock size={48} color="#1e40af" />
        <h2>관리자 인증</h2>
        <input type="password" value={inputPw} onChange={(e) => setInputPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkPassword()} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }} />
        <button onClick={checkPassword} style={{ padding: '10px 30px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>접속</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', paddingBottom: '100px' }}>
      {/* 1. 상단 메뉴 관리 */}
      <section style={{ marginBottom: '40px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '15px' }}>
        <h3>메뉴 명칭 관리</h3>
        {menus.map(m => (
          <div key={m.id} style={{ marginBottom: '10px', backgroundColor: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '10px' }}>
            <input type="text" value={m.name} onChange={(e) => setMenus(menus.map(menu => menu.id === m.id ? {...menu, name: e.target.value} : menu))} style={{ flex: 1, border: 'none', borderBottom: '1px solid #ddd', fontWeight: 'bold' }} />
            <button onClick={() => saveData('site_menu', m)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Save size={20} color="#1e40af" /></button>
          </div>
        ))}
      </section>

      {/* 2. 사업 영역 관리 */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>사업 영역 관리</h3>
          <button onClick={async () => {
            const { data } = await supabase.from('business_areas').insert({ title: '신규 영역', content: ['내용'], sort_order: businessAreas.length + 1 }).select();
            if (data) setBusinessAreas([...businessAreas, data[0]]);
          }}><Plus size={16} /> 추가</button>
        </div>
        {businessAreas.map(area => (
          <div key={area.id} style={{ border: '1px solid #eee', padding: '20px', borderRadius: '12px', marginBottom: '20px', backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input value={area.title} onChange={(e) => setBusinessAreas(businessAreas.map(a => a.id === area.id ? {...a, title: e.target.value} : a))} style={{ flex: 1, fontWeight: 'bold', fontSize: '1.1rem', border: 'none', borderBottom: '2px solid #1e40af' }} />
              <button onClick={() => saveData('business_areas', area)}><Save size={20} color="#1e40af" /></button>
            </div>
            {area.content?.map((line, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input style={{ flex: 1, padding: '6px' }} value={line} onChange={(e) => {
                  const newContent = [...area.content]; newContent[idx] = e.target.value;
                  setBusinessAreas(businessAreas.map(a => a.id === area.id ? {...a, content: newContent} : a));
                }} />
                <button onClick={() => {
                  const newContent = area.content.filter((_, i) => i !== idx);
                  setBusinessAreas(businessAreas.map(a => a.id === area.id ? {...a, content: newContent} : a));
                }}><Trash2 size={16} color="#ef4444" /></button>
              </div>
            ))}
            <button onClick={() => setBusinessAreas(businessAreas.map(a => a.id === area.id ? {...a, content: [...a.content, '']} : a))} style={{ marginTop: '10px', fontSize: '0.8rem' }}>+ 줄 추가</button>
          </div>
        ))}
      </section>

      {/* 3. 회사 연혁 관리 */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>회사 연혁 관리</h3>
          <button onClick={async () => {
            const { data } = await supabase.from('history').insert({ event_date: '2026.01', title: '제목', description: '상세내용' }).select();
            if (data) loadHistory(historyOrder);
          }}><Plus size={16} /> 추가</button>
        </div>
        {history.map(h => (
          <div key={h.id} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '10px', border: '1px solid #f1f5f9', marginBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
              <input style={{ width: '85px', textAlign: 'center' }} value={h.event_date} onChange={(e) => setHistory(history.map(item => item.id === h.id ? {...item, event_date: e.target.value} : item))} />
              <input style={{ flex: 1, fontWeight: 'bold' }} value={h.title} onChange={(e) => setHistory(history.map(item => item.id === h.id ? {...item, title: e.target.value} : item))} />
              <button onClick={() => saveData('history', h)}><Save size={20} color="#1e40af" /></button>
              <button onClick={async () => { if(confirm('삭제?')) { await supabase.from('history').delete().eq('id', h.id); loadHistory(historyOrder); } }}><Trash2 size={18} color="#ef4444" /></button>
            </div>
            <textarea style={{ width: '100%', padding: '8px', fontSize: '0.85rem', border: '1px solid #eee', borderRadius: '4px' }} value={h.description || ''} onChange={(e) => setHistory(history.map(item => item.id === h.id ? {...item, description: e.target.value} : item))} placeholder="상세 내용 입력" />
          </div>
        ))}
      </section>
    </div>
  );
}
