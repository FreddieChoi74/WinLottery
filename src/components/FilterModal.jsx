import React from 'react';
import { X, Check, RotateCcw } from 'lucide-react';
import { getBallColorClass } from '../services/lottoStats';

export default function FilterModal({
  isOpen,
  onClose,
  includeNumbers,
  setIncludeNumbers,
  excludeNumbers,
  setExcludeNumbers
}) {
  if (!isOpen) return null;

  const toggleInclude = (num) => {
    if (excludeNumbers.includes(num)) {
      setExcludeNumbers(excludeNumbers.filter(n => n !== num));
    }
    if (includeNumbers.includes(num)) {
      setIncludeNumbers(includeNumbers.filter(n => n !== num));
    } else {
      if (includeNumbers.length >= 5) {
        alert('포함할 번호는 최대 5개까지 지정할 수 있습니다.');
        return;
      }
      setIncludeNumbers([...includeNumbers, num]);
    }
  };

  const toggleExclude = (num) => {
    if (includeNumbers.includes(num)) {
      setIncludeNumbers(includeNumbers.filter(n => n !== num));
    }
    if (excludeNumbers.includes(num)) {
      setExcludeNumbers(excludeNumbers.filter(n => n !== num));
    } else {
      if (excludeNumbers.length >= 35) {
        alert('제외할 번호가 너무 많으면 조합 생성이 불가능합니다.');
        return;
      }
      setExcludeNumbers([...excludeNumbers, num]);
    }
  };

  const handleReset = () => {
    setIncludeNumbers([]);
    setExcludeNumbers([]);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 15, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '560px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-bright)' }}>
              맞춤 필터 설정 (포함수 / 제외수)
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              내가 꼭 넣고 싶은 고정수나 피하고 싶은 제외수를 지정하세요.
            </p>
          </div>
          <button
            onClick={onClose}
            className="icon-btn-ghost"
            style={{ fontSize: '1.2rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 요약 바 */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '0.75rem 1rem',
          borderRadius: '0.75rem',
          fontSize: '0.85rem'
        }}>
          <div>
            <strong style={{ color: '#38bdf8' }}>포함수 ({includeNumbers.length}/5):</strong>{' '}
            {includeNumbers.length ? includeNumbers.join(', ') : '없음'}
          </div>
          <div>
            <strong style={{ color: '#f43f5e' }}>제외수 ({excludeNumbers.length}):</strong>{' '}
            {excludeNumbers.length ? excludeNumbers.join(', ') : '없음'}
          </div>
        </div>

        {/* 1~45 번호 선택 그리드 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            💡 <strong>한 번 클릭:</strong> 포함수(파랑) / <strong>두 번 클릭:</strong> 제외수(빨강) / <strong>세 번 클릭:</strong> 해제
          </span>
          <div className="num-picker-grid">
            {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => {
              const isInc = includeNumbers.includes(num);
              const isExc = excludeNumbers.includes(num);

              let style = {};
              if (isInc) {
                style = {
                  background: '#2563eb',
                  borderColor: '#60a5fa',
                  color: '#ffffff',
                  boxShadow: '0 0 10px rgba(37, 99, 235, 0.6)'
                };
              } else if (isExc) {
                style = {
                  background: 'rgba(239, 68, 68, 0.25)',
                  borderColor: '#ef4444',
                  color: '#fca5a5',
                  textDecoration: 'line-through'
                };
              }

              return (
                <button
                  key={num}
                  className={`picker-btn ${isInc ? 'selected' : ''}`}
                  style={style}
                  onClick={() => {
                    if (isInc) {
                      toggleExclude(num);
                    } else if (isExc) {
                      setExcludeNumbers(excludeNumbers.filter(n => n !== num));
                    } else {
                      toggleInclude(num);
                    }
                  }}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* 하단 제어 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <button
            onClick={handleReset}
            className="custom-btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
          >
            <RotateCcw size={14} /> 초기화
          </button>
          <button
            onClick={onClose}
            className="generate-hero-btn"
            style={{ padding: '0.65rem 1.5rem', fontSize: '0.95rem' }}
          >
            <Check size={16} /> 설정 완료
          </button>
        </div>
      </div>
    </div>
  );
}
