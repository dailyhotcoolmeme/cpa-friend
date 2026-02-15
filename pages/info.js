import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
    { id: 'all', name: '전체' },
    { id: 'accounting', name: '회계 정보' },
    { id: 'tax', name: '세무 정보' },
    { id: 'nonprofit', name: '비영리 법인' }
];

export default function InfoSquare() {
    const [posts, setPosts] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => {
        async function fetchPosts() {
            let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
            if (activeCategory !== 'all') {
                query = query.eq('category', activeCategory);
            }
            const { data } = await query;
            setPosts(data || []);
        }
        fetchPosts();
    }, [activeCategory]);

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                <p style={{ fontSize: '1.1rem', color: '#4b5563' }}>유용한 회계, 세무 정보를 알려드립니다.</p>
            </header>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '40px', flexWrap: 'wrap' }}>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '50px',
                            border: 'none',
                            backgroundColor: activeCategory === cat.id ? '#1e40af' : '#fff',
                            color: activeCategory === cat.id ? '#fff' : '#64748b',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: activeCategory === cat.id ? '0 4px 12px rgba(30, 64, 175, 0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s',
                            border: activeCategory === cat.id ? '1px solid #1e40af' : '1px solid #e2e8f0'
                        }}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                {posts.map((post) => (
                    <Link
                        key={post.id}
                        href={`/info/${post.id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            border: '1px solid #f3f4f6'
                        }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                            }}
                        >
                            {post.thumbnail && (
                                <img src={post.thumbnail} alt={post.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                            )}
                            <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <span style={{
                                        backgroundColor: '#eff6ff',
                                        color: '#2563eb',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        padding: '4px 10px',
                                        borderRadius: '6px'
                                    }}>
                                        {CATEGORIES.find(c => c.id === post.category)?.name}
                                    </span>
                                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={14} />
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '12px', lineHeight: '1.4' }}>
                                    {post.title}
                                </h3>
                                <p style={{
                                    color: '#64748b',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.6',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    marginBottom: '20px',
                                    flexGrow: 1
                                }}>
                                    {post.summary || post.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', color: '#2563eb', fontWeight: '600', fontSize: '0.9rem' }}>
                                    자세히 보기 <ChevronRight size={16} />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {posts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '100px 0', color: '#94a3b8' }}>
                    등록된 글이 아직 없습니다.
                </div>
            )}
        </div>
    );
}
