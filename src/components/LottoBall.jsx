import React from 'react';
import { getBallColorClass } from '../services/lottoStats';

export default function LottoBall({ number, size = 'md', isBonus = false, animate = false }) {
  const colorClass = getBallColorClass(number);
  const sizeClass = size === 'sm' ? 'ball-sm' : size === 'lg' ? 'ball-lg' : '';

  return (
    <div
      className={`lotto-ball ${colorClass} ${sizeClass} ${isBonus ? 'bonus-ball' : ''}`}
      style={animate ? { animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' } : {}}
      title={`로또 번호 ${number}`}
    >
      {number}
    </div>
  );
}
