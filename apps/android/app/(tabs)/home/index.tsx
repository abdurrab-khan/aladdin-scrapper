import SafeContainer from '@/components/layout/SafeContainer';
import ListProducts from '@/components/ListProducts';
import React from 'react';

export default function Index() {
  return (
    <SafeContainer>
      <ListProducts />
    </SafeContainer>
  )
}