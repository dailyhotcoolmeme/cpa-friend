import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Shield, Menu, User, BookOpen, MapPin, MessageSquare, LayoutDashboard } from 'lucide-react';

export default function Layout({ children }) {
  const [menus, setMenus] = useState([]);

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

  // 아이콘 매칭 함수
  const getIcon = (name) => {
    if (name.includes('회사')) return <Shield size={18} />;
    if (name.includes('회계사')) return <User size={18} />;
    if (name.includes('정보')) return <BookOpen size={18} />;
    if (name.includes('길')) return <MapPin size={18} />;
    if (name.includes('게시판')) return <MessageSquare size={18} />;
    return <Menu size={18} />;
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* GNB */}
      <nav style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 5%', backgroundColor: '#ffffff', color: '#1e293b',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '1.2rem', color: '#0f172a' }}>
          <Shield color="#2563eb" fill="#2563eb" size={24} />
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>바른 회계법인</Link>
        </div>
        
        <ul style={{ display: 'flex', listStyle: 'none', gap: '24px', margin: 0, alignItems: 'center' }}>
          {menus.map((menu) => (
            <li key={menu.id}>
              <Link href={menu.path} style={{ 
                display: 'flex', alignItems: 'center', gap: '6px',
                color: '#475569', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500'
              }}>
                {getIcon(menu.name)}
                {menu.name}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/admin" style={{ backgroundColor: '#f1f5f9', padding: '8px', borderRadius: '8px', display: 'block' }}>
              <LayoutDashboard size={20} color="#64748b" />
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
        {children}
      </main>

      <footer style={{ padding: '60px 20px', backgroundColor: '#1e293b', color: '#f8fafc', marginTop: '100px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>바른 회계법인</h2>
          <p style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: '1.8' }}>
            대표: OOO | 사업자등록번호: 000-00-00000<br />
            주소: 서울특별시 강남구 ... | TEL: 02-000-0000<br />
            © 2026 바른 회계법인. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
