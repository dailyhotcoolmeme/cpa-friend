export default function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
      <h1 style={{ fontSize: '2.5rem', color: '#1B263B' }}>
        신뢰와 전문성을 바탕으로 하는<br />
        OO 회계법인입니다.
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginTop: '20px' }}>
        고객의 성공을 위한 최상의 회계 서비스를 제공합니다.
      </p>
      
      <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
        <button style={{ padding: '10px 20px', backgroundColor: '#1B263B', color: 'white', border: 'none', borderRadius: '5px' }}>
          상담 신청하기
        </button>
        <button style={{ padding: '10px 20px', backgroundColor: '#eee', border: 'none', borderRadius: '5px' }}>
          회사소개 보기
        </button>
      </div>
    </div>
  );
}
