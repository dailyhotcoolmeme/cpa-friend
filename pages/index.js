import { ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div>
      <section style={{ textAlign: 'center', padding: '60px 0' }}>
        <span style={{ backgroundColor: '#dbeafe', color: '#2563eb', padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '600' }}>
          Our Team Is Second To None
        </span>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', color: '#0f172a', marginTop: '20px', letterSpacing: '-0.02em' }}>
          우리는 고객을 <span style={{ color: '#2563eb' }}>최우선으로 일합니다.</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#64748b', marginTop: '24px', maxWidth: '700px', margin: '24px auto' }}>
          Our commitment to Speed, Precision, and Attentiveness<br />
          is second to none
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
    </div>
  );
}
