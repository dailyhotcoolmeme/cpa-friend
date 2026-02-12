import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Layout({ children }) {
  const [menus, setMenus] = useState([]);

  // 수파베이스에서 메뉴 정보를 가져옵니다 (순서대로)
  useEffect(() => {
    async function fetchMenus() {
      const { data } = await supabase
        .from('site_menu')
        .select('*')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });
      setMenus(data || []);
    }
    fetchMenus();
  }, []);

  return (
    <div>
      {/* 상단 네비게이션 바 */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '1rem 2rem', 
        backgroundColor: '#1B263B', // 신뢰감 있는 네이비
        color: 'white' 
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
          <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>OO 회계법인</Link>
        </div>
        <ul style={{ display: 'flex', listStyle: 'none', gap: '20px', margin: 0 }}>
          {menus.map((menu) => (
            <li key={menu.id}>
              <Link href={menu.path} style={{ color: 'white', textDecoration: 'none' }}>
                {menu.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* 실제 페이지 내용이 들어가는 곳 */}
      <main style={{ minHeight: '80vh', padding: '20px' }}>
        {children}
      </main>

      {/* 하단 정보 (Footer) */}
      <footer style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid #ddd', fontSize: '0.8rem' }}>
        <p>대표: OOO | 사업자번호: 000-00-00000 | 주소: 서울특별시 ...</p>
        <p>© 2026 OO 회계법인. All rights reserved.</p>
      </footer>
    </div>
  );
}