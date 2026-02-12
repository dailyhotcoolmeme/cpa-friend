import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function About() {
  const [areas, setAreas] = useState([]);
  const [history, setHistory] = useState([]);
  const [ds, setDs] = useState({}); // Design Settings

  useEffect(() => {
    async function loadData() {
      const { data: b } = await supabase.from('business_areas').select('*').order('sort_order');
      const { data: h } = await supabase.from('history').select('*').order('event_date', { ascending: false });
      const { data: d } = await supabase.from('site_design').select('*');
      
      setAreas(b || []);
      setHistory(h || []);
      const designObj = {};
      d?.forEach(item => designObj[item.key] = item.value);
      setDs(designObj);
    }
    loadData();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '10px 20px 80px' }}>
      
      {/* 사업 영역 섹션 */}
      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ 
          textAlign: 'center', marginBottom: '40px', fontWeight: '800',
          fontSize: `${ds.biz_head_size || 24}pt`, color: ds.biz_head_color || '#111827' 
        }}>사업 영역</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
          {areas.map(area => (
            <div key={area.id} style={{ padding: '30px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ 
                marginBottom: '15px', borderLeft: `5px solid ${ds.biz_title_color || '#1e40af'}`, paddingLeft: '15px', fontWeight: '700',
                fontSize: `${ds.biz_title_size || 18}pt`, color: ds.biz_title_color || '#1e40af'
              }}>{area.title}</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {area.content?.map((line, i) => (
                  <li key={i} style={{ 
                    marginBottom: '10px', display: 'flex', gap: '8px', lineHeight: '1.5',
                    fontSize: `${ds.biz_content_size || 11}pt`, color: ds.biz_content_color || '#4b5563'
                  }}>
                    <span style={{ color: ds.biz_title_color }}>•</span> {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 회사 연혁 섹션 */}
      <section>
        <h2 style={{ 
          textAlign: 'center', marginBottom: '60px', fontWeight: '800',
          fontSize: `${ds.hist_head_size || 24}pt`, color: ds.hist_head_color || '#111827' 
        }}>회사 연혁</h2>
        <div style={{ position: 'relative', maxWidth: '750px', margin: '0 auto' }}>
          <div style={{ position: 'absolute', left: '100px', top: 0, bottom: 0, width: '2px', backgroundColor: '#e5e7eb' }}></div>
          {history.map((h) => (
            <div key={h.id} style={{ display: 'flex', marginBottom: '45px', position: 'relative' }}>
              <div style={{ 
                width: '85px', textAlign: 'right', paddingRight: '30px', fontWeight: 'bold', paddingTop: '2px',
                fontSize: `${ds.hist_date_size || 11}pt`, color: ds.hist_date_color || '#2563eb'
              }}>{h.event_date}</div>
              <div style={{ position: 'absolute', left: '96px', width: '10px', height: '10px', backgroundColor: ds.hist_date_color, borderRadius: '50%', border: '4px solid #fff', zIndex: 1 }}></div>
              <div style={{ flex: 1, paddingLeft: '45px' }}>
                <h4 style={{ 
                  margin: '0 0 6px 0', fontWeight: '700',
                  fontSize: `${ds.hist_title_size || 16}pt`, color: ds.hist_title_color || '#111827'
                }}>{h.title}</h4>
                {h.description && (
                  <p style={{ 
                    margin: 0, lineHeight: '1.6', whiteSpace: 'pre-wrap',
                    fontSize: `${ds.hist_desc_size || 11}pt`, color: ds.hist_desc_color || '#6b7280'
                  }}>{h.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
