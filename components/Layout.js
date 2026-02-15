import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  Shield,
  User,
  BookOpen,
  MapPin,
  MessageSquare,
  LayoutDashboard,
  Menu,
  History as HistoryIcon
} from 'lucide-react';

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

  const getIcon = (menu) => {
    const name = menu.name;
    const path = menu.path;
    if (name.includes('회사') || name.includes('소개')) return <Shield size={18} />;
    if (name.includes('회계사') || name.includes('인사')) return <User size={18} />;
    if (name.includes('연혁') || path.includes('history')) return <HistoryIcon size={18} />;
    if (name.includes('정보') || name.includes('광장')) return <BookOpen size={18} />;
    if (name.includes('오시는') || name.includes('길')) return <MapPin size={18} />;
    if (name.includes('게시판') || name.includes('상담')) return <MessageSquare size={18} />;
    return <Menu size={18} />;
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <nav style={{ borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 100 }}>
        <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield color="#1e40af" fill="#1e40af" size={22} />
            <Link href="/" style={{ fontSize: '1.2rem', fontWeight: '800', color: '#111827', textDecoration: 'none' }}>
              회계법인 아성 김재철 회계사
            </Link>
          </div>
          <Link href="/admin" style={{ color: '#9ca3af' }}><LayoutDashboard size={20} /></Link>
        </div>
        <div style={{ overflowX: 'auto', display: 'flex', borderTop: '1px solid #f3f4f6', scrollbarWidth: 'none' }}>
          <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0 }}>
            {menus.map((menu) => {
              const isActive = router.pathname === menu.path;
              return (
                <li key={menu.id}>
                  <Link href={menu.path} style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 20px',
                    fontSize: '0.95rem', fontWeight: isActive ? '700' : '500',
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
      <footer style={{ padding: '40px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>© 2026 회계법인 아성 김재철 회계사. All rights reserved.</p>
      </footer>
      <style jsx global>{`
        body { margin: 0; padding: 0; }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
