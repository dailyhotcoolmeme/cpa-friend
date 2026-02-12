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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '10px 20px 80px', boxSizing: 'border-box' }}>
      
      {/* 1. 사업 영역 섹션 */}
      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ 
          textAlign: 'center', marginBottom: '40px', fontWeight: '800',
          fontSize: `${ds.biz_head_size || 22}pt`, color: ds.biz_head_color || '#111827' 
        }}>사업 영역</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
          {areas.map(area => (
            <div key={area.id} style={{ padding: '30px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ 
                marginBottom: '15px', borderLeft: `5px solid ${ds.biz_title_color || '#1e40af'}`, paddingLeft: '15px', fontWeight: '700',
                fontSize: `${ds.biz_title_size || 18}pt`, color: ds.biz_title_color || '#1e40af'
              }}>{area.title}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {area.content?.map((line, i) => (
                  <li key={i} style={{ 
                    marginBottom: '10px', display: 'flex', gap: '8px', lineHeight: '1.5',
                    fontSize: `${ds.biz_content_size || 11}pt`, color: ds.biz_content_color || '#4b5563'
                  }}>
                    <span style={{ color: ds.biz_title_color || '#1e40af', flexShrink: 0 }}>•</span> {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 2. 회사 연혁 섹션 (가로 정렬 정밀 수정) */}
      <section>
        <h2 style={{ 
          textAlign: 'center', marginBottom: '60px', fontWeight: '800',
          fontSize: `${ds.hist_head_size || 22}pt`, color: ds.hist_head_color || '#111827' 
        }}>회사 연혁</h2>
        
        <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative' }}>
          {history.map((h, index) => (
            <div key={h.id} style={{ display: 'flex', marginBottom: '40px', position: 'relative' }}>
              
              {/* 왼쪽: 날짜 영역 */}
              <div style={{ 
                width: '100px', 
                textAlign: 'right', 
                paddingRight: '25px', 
                flexShrink: 0,
                fontWeight: 'bold',
                fontSize: `${ds.hist_date_size || 11}pt`, 
                color: ds.hist_date_color || '#2563eb',
                lineHeight: '1.2',
                marginTop: '4px' // 제목 첫 줄과 맞추기 위한 미세 조정
              }}>
                {h.event_date}
              </div>

              {/* 중앙: 점(Circle) 및 세로 라인 */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                position: 'relative',
                flexShrink: 0 
              }}>
                {/* 점 */}
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: ds.hist_date_color || '#2563eb', 
                  borderRadius: '50%', 
                  border: '3px solid #fff', 
                  boxShadow: '0 0 0 1px #e5e7eb',
                  zIndex: 2,
                  marginTop: '7px' // 글자 높이 중앙에 맞춤
                }}></div>
                
                {/* 수직 선 (마지막 요소가 아닐 때만 노출) */}
                {index !== history.length - 1 && (
                  <div style={{ 
                    position: 'absolute',
                    top: '20px',
                    bottom: '-40px',
                    width: '2px', 
                    backgroundColor: '#e5e7eb',
                    zIndex: 1
                  }}></div>
                )}
              </div>

              {/* 오른쪽: 내용 영역 */}
              <div style={{ flex: 1, paddingLeft: '25px' }}>
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  fontWeight: '700',
                  lineHeight: '1.3',
                  fontSize: `${ds.hist_title_size || 16}pt`, 
                  color: ds.hist_title_color || '#111827'
                }}>
                  {h.title}
                </h4>
                {h.description && (
                  <p style={{ 
                    margin: 0, 
                    lineHeight: '1.6', 
                    whiteSpace: 'pre-wrap',
                    fontSize: `${ds.hist_desc_size || 11}pt`, 
                    color: ds.hist_desc_color || '#6b7280'
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
