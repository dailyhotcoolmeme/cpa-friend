import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
    { id: 'all', name: '전체' },
    { id: 'accounting', name: '회계 정보' },
    { id: 'tax', name: '세무 정보' },
    { id: 'nonprofit', name: '비영리 법인' }
];

export default function PostDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [post, setPost] = useState(null);

    useEffect(() => {
        if (!id) return;
        async function fetchPost() {
            const { data } = await supabase.from('posts').select('*').eq('id', id).single();
            setPost(data);
        }
        fetchPost();
    }, [id]);

    if (!post) return <div style={{ textAlign: 'center', padding: '100px' }}>로딩 중...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <Link href="/info" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', marginBottom: '30px', fontWeight: '600' }}>
                <ArrowLeft size={18} /> 목록으로 돌아가기
            </Link>

            <header style={{ marginBottom: '40px', borderBottom: '1px solid #f1f5f9', paddingBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span style={{
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        padding: '4px 12px',
                        borderRadius: '6px'
                    }}>
                        {CATEGORIES.find(c => c.id === post.category)?.name}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={16} />
                        {new Date(post.created_at).toLocaleDateString()}
                    </span>
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827', lineHeight: '1.3' }}>{post.title}</h1>
            </header>

            {post.thumbnail && (
                <img src={post.thumbnail} alt={post.title} style={{ width: '100%', borderRadius: '16px', marginBottom: '40px' }} />
            )}

            <div
                className="post-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
                style={{
                    color: '#374151',
                    lineHeight: '1.8',
                    fontSize: '1.1rem',
                    wordBreak: 'break-word'
                }}
            />

            <style jsx global>{`
        .post-content h2 { font-size: 1.8rem; margin-top: 2rem; margin-bottom: 1rem; color: #111827; }
        .post-content h3 { font-size: 1.4rem; margin-top: 1.5rem; margin-bottom: 0.8rem; color: #111827; }
        .post-content p { margin-bottom: 1.2rem; }
        .post-content img { max-width: 100%; height: auto; border-radius: 8px; }
        .post-content ul, .post-content ol { padding-left: 1.5rem; margin-bottom: 1.2rem; }
        .post-content li { margin-bottom: 0.5rem; }
        .post-content blockquote { border-left: 4px solid #e5e7eb; padding-left: 1rem; color: #6b7280; font-style: italic; margin: 2rem 0; }
      `}</style>
        </div>
    );
}
