import SafeContainer from '@/components/layout/SafeContainer';
import ProductList from '@/components/list/ProductList';
import ScrapeFAB from './_components/ScrapeFAB';
import React from 'react';

export default function Index() {
  return (
    <SafeContainer>
      <ProductList />
      <ScrapeFAB />
    </SafeContainer>
  )
}
