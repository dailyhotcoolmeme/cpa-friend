import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  Shield,
  User,
  BookOpen,
  Handshake,
  MapPin,
  IdCard,
  MessageSquare,
  LayoutDashboard,
  CircleUserRound,
  UserRoundCheck,
  SquareUserRound,
  BookOpenCheck,
  BookOpenText,
  Building,
  MessageCircleQuestionMark,
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
    if (name.includes('운영자') || name.includes('소개')) return <IdCard size={18} />;
    if (name.includes('업무') || name.includes('문의')) return <Handshake size={18} />;
    if (name.includes('회계') || path.includes('정보')) return <BookOpenText size={18} />;
    if (name.includes('세무') || name.includes('정보')) return <BookOpenCheck size={18} />;
    if (name.includes('비영리') || name.includes('법인')) return <Building size={18} />;
    if (name.includes('게시판') || name.includes('상담')) return <MessageSquare size={18} />;
    return <Menu size={18} />;
  };

  return (
    <div style={{ backgroundColor: '#f8f8f8', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <nav style={{ borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, backgroundColor: '#f8f8f8', zIndex: 100 }}>
        <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <img
              src="/logo.png" // 이미지 경로 (예: public/logo.png)
              alt="로고"
              style={{ width: '22px', height: '22px', objectFit: 'contain' }}
            />
            <Link
              href="/"
              style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'flex', // 글자들 사이의 간격을 미세하게 조정하고 싶다면 flex를 쓰면 좋습니다.
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
        <div style={{ overflowX: 'auto', display: 'flex', scrollbarWidth: 'none' }}>
          <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0 }}>
            {menus.map((menu) => {
              const isActive = router.pathname === menu.path;
              return (
                <li key={menu.id}>
                  <Link href={menu.path} style={{
                    display: 'flex', alignItems: 'center', gap: '4px', padding: '14px 20px',
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
        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>© 2026 회계법인 아성 김재철 회계사. All rights reserved.</p>
      </footer>
      <style jsx global>{`
        body { margin: 0; padding: 0; }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
