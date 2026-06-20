import SafeContainer from "../../src/components/layout/SafeContainer.tsx";
import ProductList from "../../src/components/list/ProductList.tsx";
import ScrapeFAB from "./_components/ScrapeFAB.tsx";

export default function TabsIndex() {
  return (
    <SafeContainer>
      <ProductList />
      <ScrapeFAB />
    </SafeContainer>
  );
}
