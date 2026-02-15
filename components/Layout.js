import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  Handshake,
  IdCard,
  BookOpenText,
  Menu
} from 'lucide-react';

export default function Layout({ children }) {
  const [menus, setMenus] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchMenus() {
      // Fetch only the 3 main menus to ensure consistency
      const { data } = await supabase
        .from('site_menu')
        .select('*')
        .in('path', ['/team', '/services', '/info'])
        .order('sort_order', { ascending: true });

      // Ensure we have exactly these three in order if possible
      const ordered = ['/team', '/services', '/info'].map(path =>
        (data || []).find(m => m.path === path) || { path, name: path === '/team' ? '운영자 소개' : path === '/services' ? '업무 문의' : '정보 광장' }
      );
      setMenus(ordered);
    }
    fetchMenus();
  }, []);

  const getIcon = (menu) => {
    const path = menu.path;
    if (path === '/team') return <IdCard size={18} />;
    if (path === '/services') return <Handshake size={18} />;
    if (path === '/info') return <BookOpenText size={18} />;
    return <Menu size={18} />;
  };

  return (
    <div style={{ backgroundColor: '#f8f8f8', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <nav style={{ borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, backgroundColor: '#f8f8f8', zIndex: 100 }}>
        <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <img
              src="/logo.png"
              alt="로고"
              style={{ width: '22px', height: '22px', objectFit: 'contain' }}
            />
            <Link
              href="/"
              style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'flex',
                gap: '1px'
              }}
            >
              <span style={{ color: '#333333ff' }}>회계법인</span>
              <span style={{ color: '#55abddff' }}>아성</span>
              <span style={{ color: '#276cffff' }}>김재철</span>
              <span style={{ color: '#333333ff' }}>회계사</span>
            </Link>
          </div>
        </div>
        <div style={{ overflowX: 'auto', display: 'flex' }}>
          <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, width: '100%' }}>
            {menus.map((menu) => {
              const isActive = router.pathname === menu.path || (menu.path === '/info' && router.pathname.startsWith('/info/'));
              return (
                <li key={menu.path} style={{ flex: 1 }}>
                  <Link href={menu.path} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '14px 10px',
                    fontSize: '0.95rem', fontWeight: isActive ? '800' : '600',
                    color: isActive ? '#1e40af' : '#4b5563', textDecoration: 'none',
                    borderBottom: isActive ? '3px solid #1e40af' : '3px solid transparent',
                    whiteSpace: 'nowrap'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', color: isActive ? '#1e40af' : '#94a3b8' }}>
                      {getIcon(menu)}
                    </span>
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
      <footer style={{ padding: '20px 20px', backgroundColor: '#f8f8f8', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          © 2026 회계법인 아성 <Link href="/admin" style={{ color: 'inherit', textDecoration: 'none', cursor: 'default' }}>김재철</Link> 회계사. All rights reserved.
        </p>
      </footer>
      <style jsx global>{`
        body { margin: 0; padding: 0; }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
