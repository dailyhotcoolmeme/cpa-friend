import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Save, List } from 'lucide-react';

export default function AdminHome() {
  const [menus, setMenus] = useState([]);

  // useEffect 안에서 모든 비동기 처리를 완료하는 구조로 변경
  useEffect(() => {
    async function loadInitialData() {
      const { data, error } = await supabase
        .from('site_menu')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (!error && data) {
        setMenus(data);
      }
    }
    
    loadInitialData();
  }, []); // 처음에 한 번만 실행

  // 메뉴 이름 수정 기능 (상태 최적화)
  async function updateMenuName(id, newName) {
    if (!newName) return;
    
    // 1. 서버 업데이트
    const { error } = await supabase
      .from('site_menu')
      .update({ name: newName })
      .eq('id', id);
    
    if (error) {
      alert('수정 실패: ' + error.message);
    } else {
      // 2. 서버 통신 성공 시에만 로컬 상태 반영 (전체 리렌더링 방지)
      setMenus(prev => prev.map(m => m.id === id ? { ...m, name: newName } : m));
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
        <List size={28} color="#2563eb" />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>메뉴 구성 관리</h2>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {menus.map((menu) => (
          <div key={menu.id} style={{ 
            backgroundColor: 'white', padding: '20px', borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', 
            alignItems: 'center', gap: '15px', border: '1px solid #e2e8f0' 
          }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '5px' }}>
                메뉴 이름
              </label>
              <input 
                type="text" 
                defaultValue={menu.name} 
                onBlur={(e) => updateMenuName(menu.id, e.target.value)}
                style={{ 
                  padding: '8px 12px', width: '100%', borderRadius: '6px', 
                  border: '1px solid #cbd5e1', fontSize: '1rem' 
                }}
              />
            </div>
            <div style={{ textAlign: 'right', minWidth: '80px' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>순서: {menu.sort_order}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#eff6ff', borderRadius: '12px', color: '#1e40af' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Save size={16} /> 메뉴 이름을 바꾸고 입력창 바깥을 누르면 즉시 홈페이지에 반영됩니다.
        </p>
      </div>
    </div>
  );
}
