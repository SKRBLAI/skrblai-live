'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const DynamicFloatingPercy = dynamic(
  () => import('./FloatingPercy'),
  { ssr: false }
);

export default function ClientAssistantWrapper() {
  return <DynamicFloatingPercy />;
}
