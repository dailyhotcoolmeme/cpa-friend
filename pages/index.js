import { ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div>
      <section style={{ textAlign: 'center', padding: '60px 0' }}>
        <span style={{ backgroundColor: '#dbeafe', color: '#2563eb', padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '600' }}>
          전문가 그룹의 맞춤 솔루션
        </span>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', color: '#0f172a', marginTop: '20px', letterSpacing: '-0.02em' }}>
          복잡한 회계를 <span style={{ color: '#2563eb' }}>명쾌하게.</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#64748b', marginTop: '24px', maxWidth: '700px', margin: '24px auto' }}>
          대표 회계사와 소속 전문가들이 직접 발로 뛰며<br /> 
          귀사의 재무 건전성과 성장을 지원합니다.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '40px' }}>
          <button style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#2563eb', color: 'white', 
            padding: '14px 28px', borderRadius: '10px', border: 'none', fontWeight: '600', cursor: 'pointer' 
          }}>
            상담 예약하기 <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1 row)', gap: '20px', marginTop: '60px' }}>
        {['회계감사', '세무자문', 'M&A 컨설팅'].map((item) => (
          <div key={item} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <CheckCircle color="#2563eb" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '10px' }}>{item}</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>차별화된 전략으로 최적의 결과를 만들어냅니다.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
