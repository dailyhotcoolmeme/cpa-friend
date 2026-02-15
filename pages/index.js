import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div>
      <section style={{ textAlign: 'center', padding: '60px 0' }}>
        <span style={{ backgroundColor: '#dbeafe', color: '#2563eb', padding: '6px 16px', borderRadius: '20px', fontSize: '1.0rem', fontWeight: '600' }}>
          Our Team Is Second To None
        </span>
        <h1 style={{
          fontSize: '2.0rem',
          fontWeight: '600',
          marginTop: '48px',
          letterSpacing: '-0.02em',
          lineHeight: '1.4',
          display: 'block' // 한 줄에 나오게 합니다.
        }}>
          <span style={{ color: '#3b6de2ff' }}>우리</span>
          <span style={{ color: '#0f172a' }}>는 고객을 </span>
          <br />
          <span style={{ color: '#3b6de2ff' }}>최우선</span>
          <span style={{ color: '#0f172a' }}>으로 일합니다.</span>
        </h1>
        <p style={{ fontSize: '1.0rem', color: '#64748b', marginTop: '60px', maxWidth: '700px', margin: '24px auto' }}>
          Our commitment to <br />
          Speed, Precision, and Attentiveness<br />
          is second to none
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '120px' }}>
          <button
            onClick={() => window.location.href = 'mailto:26jckim@naver.com?subject=상담 예약 신청&body=안녕하세요, 상담 예약을 신청합니다.'}
            style={{
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
