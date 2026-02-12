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

  const getIcon = (name) => {
    if (name.includes('회사')) return <Shield size={16} />;
    if (name.includes('회계사')) return <User size={16} />;
    if (name.includes('정보')) return <BookOpen size={16} />;
    if (name.includes('길')) return <MapPin size={16} />;
    if (name.includes('게시판')) return <MessageSquare size={16} />;
    return <Menu size={16} />;
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* GNB: 상단바 */}
      <nav style={{ 
        backgroundColor: '#ffffff', 
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        {/* 로고 영역 */}
        <div style={{ 
          padding: '12px 20px', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>
            <Shield color="#2563eb" fill="#2563eb" size={20} />
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>바른 회계법인</Link>
          </div>
          <Link href="/admin" style={{ color: '#64748b' }}>
            <LayoutDashboard size={20} />
          </Link>
        </div>

        {/* 메뉴 영역: 모바일에서 가로로 넘길 수 있게 수정 */}
        <div style={{ 
          overflowX: 'auto', 
          whiteSpace: 'nowrap', 
          padding: '10px 10px',
          WebkitOverflowScrolling: 'touch' // 아이폰 부드러운 스크롤
        }}>
          <ul style={{ 
            display: 'inline-flex', listStyle: 'none', gap: '15px', margin: 0, padding: '0 10px'
          }}>
            {menus.map((menu) => (
              <li key={menu.id}>
                <Link href={menu.path} style={{ 
                  display: 'flex', alignItems: 'center', gap: '5px',
                  color: '#475569', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600',
                  padding: '6px 12px', backgroundColor: '#f8fafc', borderRadius: '20px',
                  border: '1px solid #f1f5f9'
                }}>
                  {getIcon(menu.name)}
                  {menu.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
        {children}
      </main>

      <footer style={{ padding: '40px 20px', backgroundColor: '#1e293b', color: '#f8fafc', marginTop: '60px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', opacity: 0.7, lineHeight: '1.6' }}>
          © 2026 바른 회계법인. All rights reserved.
        </p>
      </footer>

      {/* 가로 스크롤바 숨기기 스타일 */}
      <style jsx global>{`
        div::-webkit-scrollbar { display: none; }
        div { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
