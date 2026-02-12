import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Shield, LayoutDashboard } from 'lucide-react';

export default function Layout({ children }) {
  const [menus, setMenus] = useState([]);
  const router = useRouter();

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
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* 상단 헤더 */}
      <nav style={{ borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 100 }}>
        <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield color="#1e40af" fill="#1e40af" size={22} />
            <Link href="/" style={{ fontSize: '1.2rem', fontWeight: '800', color: '#111827', textDecoration: 'none' }}>
              바른 회계법인
            </Link>
          </div>
          <Link href="/admin" style={{ color: '#9ca3af' }}><LayoutDashboard size={20} /></Link>
        </div>

        {/* 사각형 탭 메뉴 영역 */}
        <div style={{ overflowX: 'auto', display: 'flex', borderTop: '1px solid #f3f4f6' }}>
          <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0 }}>
            {menus.map((menu) => {
              const isActive = router.pathname === menu.path;
              return (
                <li key={menu.id}>
                  <Link href={menu.path} style={{
                    display: 'block',
                    padding: '14px 20px',
                    fontSize: '0.95rem',
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? '#1e40af' : '#4b5563',
                    textDecoration: 'none',
                    borderBottom: isActive ? '3px solid #1e40af' : '3px solid transparent',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}>
                    {menu.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '30px 20px' }}>
        {children}
      </main>

      <style jsx global>{`
        body { margin: 0; padding: 0; }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
