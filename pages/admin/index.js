import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminHome() {
  const [menus, setMenus] = useState([]);

  // 1. 현재 저장된 메뉴들 불러오기
  useEffect(() => {
    fetchMenus();
  }, []);

  async function fetchMenus() {
    const { data } = await supabase.from('site_menu').select('*').order('sort_order', { ascending: true });
    setMenus(data || []);
  }

  // 2. 메뉴 이름 수정 기능
  async function updateMenuName(id, newName) {
    await supabase.from('site_menu').update({ name: newName }).eq('id', id);
    fetchMenus(); // 수정한 뒤 다시 불러오기
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>🛠️ 관리자 페이지 - 메뉴 설정</h2>
      <p>여기서 수정하면 홈페이지 상단 메뉴가 즉시 바뀝니다.</p>
      <hr />
      
      {menus.map((menu) => (
        <div key={menu.id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd' }}>
          <label style={{ display: 'block', fontSize: '0.8rem' }}>메뉴명</label>
          <input 
            type="text" 
            defaultValue={menu.name} 
            onBlur={(e) => updateMenuName(menu.id, e.target.value)}
            style={{ padding: '5px', width: '70%', marginRight: '10px' }}
          />
          <span>(순서: {menu.sort_order})</span>
        </div>
      ))}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f9f9f9' }}>
        <h4>💡 도움말</h4>
        <p>글자를 고치고 칸 밖을 클릭하면 자동으로 저장됩니다.</p>
      </div>
    </div>
  );
}
