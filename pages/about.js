import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function About() {
  const [areas, setAreas] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function loadData() {
      const { data: b } = await supabase.from('business_areas').select('*').order('sort_order');
      const { data: h_order } = await supabase.from('admin_config').select('value').eq('key', 'history_order').single();
      const { data: h } = await supabase.from('history').select('*').order('event_date', { ascending: h_order?.value === 'asc' });
      setAreas(b || []);
      setHistory(h || []);
    }
    loadData();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '10px 20px 80px' }}>
      
      {/* 사업 영역 섹션 */}
      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2rem', fontWeight: '800' }}>사업 영역</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
          {areas.map(area => (
            <div key={area.id} style={{ padding: '30px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ 
                color: area.title_color || '#1e40af', 
                fontSize: `${area.title_size || 18}pt`, 
                marginBottom: '15px', 
                borderLeft: `5px solid ${area.title_color || '#1e40af'}`, 
                paddingLeft: '15px',
                fontWeight: '700'
              }}>{area.title}</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {area.content?.map((line, i) => (
                  <li key={i} style={{ 
                    marginBottom: '10px', 
                    color: area.content_color || '#4b5563', 
                    fontSize: `${area.content_size || 11}pt`,
                    display: 'flex', gap: '8px', lineHeight: '1.5' 
                  }}>
                    <span style={{ color: area.title_color || '#1e40af' }}>•</span> {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 회사 연혁 섹션 */}
      <section>
        <h2 style={{ textAlign: 'center', marginBottom: '60px', fontSize: '2rem', fontWeight: '800' }}>회사 연혁</h2>
        <div style={{ position: 'relative', maxWidth: '750px', margin: '0 auto' }}>
          <div style={{ position: 'absolute', left: '100px', top: 0, bottom: 0, width: '2px', backgroundColor: '#e5e7eb' }}></div>
          {history.map((h) => (
            <div key={h.id} style={{ display: 'flex', marginBottom: '45px', position: 'relative' }}>
              <div style={{ width: '85px', textAlign: 'right', paddingRight: '30px', fontWeight: 'bold', color: '#2563eb', fontSize: '1rem' }}>{h.event_date}</div>
              <div style={{ position: 'absolute', left: '96px', width: '10px', height: '10px', backgroundColor: '#2563eb', borderRadius: '50%', border: '4px solid #fff', zIndex: 1 }}></div>
              <div style={{ flex: 1, paddingLeft: '45px' }}>
                <h4 style={{ 
                  margin: '0 0 6px 0', 
                  fontSize: `${h.title_size || 16}pt`, 
                  color: h.title_color || '#111827', 
                  fontWeight: '700' 
                }}>{h.title}</h4>
                {h.description && (
                  <p style={{ 
                    margin: 0, 
                    color: h.desc_color || '#6b7280', 
                    fontSize: `${h.desc_size || 11}pt`, 
                    lineHeight: '1.6', whiteSpace: 'pre-wrap' 
                  }}>
                    {h.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
