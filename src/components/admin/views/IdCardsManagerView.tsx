import React from 'react';
import { DigitalIdCardGenerator } from '../../press/DigitalIdCardGenerator';

export const IdCardsManagerView: React.FC = () => {
  return (
    <div className="space-y-6">
      <DigitalIdCardGenerator />
    </div>
  );
};

