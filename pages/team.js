import { UserCheck, Award, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Team() {
  const [staffs, setStaffs] = useState([]);

  useEffect(() => {
    async function fetchStaff() {
      const { data } = await supabase.from('staff').select('*').order('sort_order', { ascending: true });
      setStaffs(data || []);
    }
    fetchStaff();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p style={{ fontSize: '0.9rem', color: '#4b5563' }}>최고의 전문성을 바탕으로 <br />고객의 성공을 함께합니다.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
        {staffs.map((person) => (
          <div key={person.id} style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #f3f4f6',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', gap: '24px', padding: '32px', alignItems: 'center', borderBottom: '1px solid #f8fafc' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '16px',
                backgroundColor: '#f1f5f9',
                overflow: 'hidden',
                flexShrink: 0
              }}>
                {person.photo_url ? (
                  <img src={person.photo_url} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                    <UserCheck size={48} />
                  </div>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', margin: '10px', color: '#111827' }}>{person.name}</h3>
                <span style={{
                  display: 'inline-block',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  marginBottom: '8px'
                }}>
                  {person.position}
                </span>
              </div>
            </div>

            <div style={{ padding: '32px', backgroundColor: '#fff', flexGrow: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Award size={20} color="#1e40af" />
                <span style={{ fontWeight: '700', fontSize: '1rem', color: '#1e40af' }}>주요 약력</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {(Array.isArray(person.highlights) ? person.highlights : (person.description || '').split('\n')).filter(item => item && item.trim()).map((item, idx) => (
                  <li key={idx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    marginBottom: '12px',
                    fontSize: '1rem',
                    color: '#475569',
                    lineHeight: '1.5'
                  }}>
                    <CheckCircle2 size={16} color="#94a3b8" style={{ marginTop: '4px', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

