import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, List, Save, Eye, EyeOff } from 'lucide-react';

export default function AdminHome() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inputPw, setInputPw] = useState('');
  const [menus, setMenus] = useState([]);

  async function checkPassword() {
    const { data } = await supabase.from('admin_config').select('value').eq('key', 'admin_password').single();
    if (data && data.value === inputPw) {
      setIsAuthorized(true);
      loadMenus();
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  }

  async function loadMenus() {
    const { data } = await supabase.from('site_menu').select('*').order('sort_order', { ascending: true });
    if (data) setMenus(data);
  }

  // 메뉴 이름 수정
  async function updateMenuName(id, newName) {
    if (!newName) return;
    const { error } = await supabase.from('site_menu').update({ name: newName }).eq('id', id);
    if (!error) setMenus(prev => prev.map(m => m.id === id ? { ...m, name: newName } : m));
  }

  // 메뉴 보임/숨김 토글 기능 추가
  async function toggleVisibility(id, currentStatus) {
    const { error } = await supabase.from('site_menu').update({ is_visible: !currentStatus }).eq('id', id);
    if (!error) setMenus(prev => prev.map(m => m.id === id ? { ...m, is_visible: !currentStatus } : m));
  }

  if (!isAuthorized) {
    return (
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <Lock size={48} color="#1e40af" />
        <h2 style={{ margin: 0 }}>관리자 인증</h2>
        <input 
          type="password" 
          placeholder="비밀번호 입력" 
          value={inputPw}
          onChange={(e) => setInputPw(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '200px', textAlign: 'center' }}
        />
        <button onClick={checkPassword} style={{ padding: '10px 30px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
          접속하기
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
        <List size={24} color="#1e40af" />
        <h2 style={{ margin: 0 }}>메뉴 관리</h2>
      </div>
      
      <div style={{ display: 'grid', gap: '10px' }}>
        {menus.map(menu => (
          <div key={menu.id} style={{ 
            display: 'flex', alignItems: 'center', gap: '10px', 
            padding: '15px', border: '1px solid #eee', borderRadius: '10px',
            backgroundColor: menu.is_visible ? '#fff' : '#f9fafb'
          }}>
            <button 
              onClick={() => toggleVisibility(menu.id, menu.is_visible)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: menu.is_visible ? '#1e40af' : '#94a3b8' }}
            >
              {menu.is_visible ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
            <input 
              type="text" 
              defaultValue={menu.name} 
              onBlur={(e) => updateMenuName(menu.id, e.target.value)}
              style={{ flex: 1, padding: '8px', border: 'none', borderBottom: '1px solid #ddd', fontSize: '1rem', background: 'transparent' }}
            />
          </div>
        ))}
      </div>
      <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '20px' }}>
        <Save size={12} /> 눈 아이콘을 눌러 메뉴를 숨기거나 보일 수 있습니다. 수정 후 칸 밖을 클릭하면 저장됩니다.
      </p>
    </div>
  );
}
