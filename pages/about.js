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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '10px 20px 80px' }}> {/* 상단 여백 줄임 */}
      
      {/* 사업 영역 섹션 */}
      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2rem', fontWeight: '800', color: '#111827' }}>사업 영역</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
          {areas.map(area => (
            <div key={area.id} style={{ padding: '30px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              {/* 사업 영역 박스 제목 색상: 진한 파란색 */}
              <h3 style={{ color: '#1e40af', marginBottom: '15px', borderLeft: '5px solid #1e40af', paddingLeft: '15px', fontSize: '1.25rem' }}>{area.title}</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {area.content?.map((line, i) => (
                  <li key={i} style={{ marginBottom: '10px', color: '#4b5563', display: 'flex', gap: '8px', lineHeight: '1.5' }}>
                    <span style={{ color: '#1e40af', fontWeight: 'bold' }}>•</span> {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 회사 연혁 섹션 */}
      <section>
        <h2 style={{ textAlign: 'center', marginBottom: '60px', fontSize: '2rem', fontWeight: '800', color: '#111827' }}>회사 연혁</h2>
        <div style={{ position: 'relative', maxWidth: '750px', margin: '0 auto' }}>
          {/* 수직선 */}
          <div style={{ position: 'absolute', left: '100px', top: 0, bottom: 0, width: '2px', backgroundColor: '#e5e7eb' }}></div>
          
          {history.map((h) => (
            <div key={h.id} style={{ display: 'flex', marginBottom: '45px', position: 'relative' }}>
              {/* 년월 색상: 파란색 강조 */}
              <div style={{ width: '85px', textAlign: 'right', paddingRight: '30px', fontWeight: 'bold', color: '#2563eb', fontSize: '1rem', paddingTop: '2px' }}>
                {h.event_date}
              </div>
              
              {/* 타임라인 점 */}
              <div style={{ position: 'absolute', left: '96px', width: '10px', height: '10px', backgroundColor: '#2563eb', borderRadius: '50%', border: '4px solid #fff', zIndex: 1 }}></div>
              
              <div style={{ flex: 1, paddingLeft: '45px' }}>
                {/* 이벤트 제목 색상: 검정색 */}
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: '#111827', fontWeight: '700' }}>{h.title}</h4>
                {/* 상세 내용: 작은 글씨와 회색 */}
                {h.description && (
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.88rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
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
