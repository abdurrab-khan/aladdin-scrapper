import ScrapeFAB from "./_components/ScrapeFAB";
import ProductList from "@/components/list/ProductList";
import SafeContainer from "@/components/layout/SafeContainer";

export default function TabsIndex() {
  return (
    <SafeContainer>
      <ProductList />
      <ScrapeFAB />
    </SafeContainer>
  );
}
