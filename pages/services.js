import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Mail, Briefcase, CircleArrowRight, Minus } from 'lucide-react';

export default function Services() {
    const [services, setServices] = useState([]);

    useEffect(() => {
        async function fetchServices() {
            const { data } = await supabase.from('services').select('*').order('sort_order', { ascending: true });
            setServices(data || []);
        }
        fetchServices();
    }, []);

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                <p style={{ fontSize: '1.0rem', color: '#4b5563' }}>필요하신 업무에 대해 <br />상세한 안내와 견적을 도와드립니다.</p>
            </header>

            <div style={{ display: 'grid', gap: '30px' }}>
                {services.map((service) => (
                    <div key={service.id} style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        padding: '40px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                        border: '1px solid #f3f4f6',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#1e40af',
                            marginBottom: '20px',
                            marginTop: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <CircleArrowRight size={26} /> {service.name}
                        </h2>
                        <div style={{ marginBottom: '30px', flexGrow: 1 }}>
                            {service.description?.map((line, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                                    <Minus size={14} color="#94a3b8" style={{ marginTop: '0.65rem', flexShrink: 0 }} />
                                    <p style={{ margin: 0, color: '#4b5563', lineHeight: '1.6', fontSize: '1.05rem' }}>{line}</p>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex' }}>
                            <a
                                href={`mailto:26jckim@naver.com?subject=[견적문의] ${service.name}`}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    backgroundColor: '#1e40af',
                                    color: 'white',
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e3a8a'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1e40af'}
                            >
                                <Mail size={18} />
                                견적 문의하기
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
