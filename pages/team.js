import { UserCheck, Award } from 'lucide-react';
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
    <div>
      <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '40px', textAlign: 'center' }}>전문가 소개</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        {staffs.map((person) => (
          <div key={person.id} style={{ backgroundColor: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#eff6ff', padding: '15px', borderRadius: '50%' }}>
                <UserCheck size={32} color="#2563eb" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>{person.name}</h3>
                <span style={{ color: '#2563eb', fontSize: '0.9rem', fontWeight: '600' }}>{person.position}</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <Award size={18} color="#64748b" />
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>주요 약력</span>
              </div>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                {person.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
