import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, List, Save } from 'lucide-react';

export default function AdminHome() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inputPw, setInputPw] = useState('');
  const [menus, setMenus] = useState([]);

  // 비번 체크 함수
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

  async function updateMenuName(id, newName) {
    const { error } = await supabase.from('site_menu').update({ name: newName }).eq('id', id);
    if (!error) setMenus(prev => prev.map(m => m.id === id ? { ...m, name: newName } : m));
  }

  // 로그인 전 화면
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

  // 로그인 후 관리 화면
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
        <List size={24} color="#1e40af" />
        <h2 style={{ margin: 0 }}>메뉴 관리</h2>
      </div>
      {menus.map(menu => (
        <div key={menu.id} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #eee', borderRadius: '10px' }}>
          <input 
            type="text" 
            defaultValue={menu.name} 
            onBlur={(e) => updateMenuName(menu.id, e.target.value)}
            style={{ width: '100%', padding: '8px', border: 'none', borderBottom: '1px solid #ddd', fontSize: '1rem' }}
          />
        </div>
      ))}
      <p style={{ color: '#666', fontSize: '0.8rem' }}><Save size={12} /> 입력 후 칸 밖을 클릭하면 저장됩니다.</p>
    </div>
  );
}
