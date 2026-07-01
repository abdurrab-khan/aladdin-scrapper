import ScrapeFAB from "./_components/ScrapeFAB";
import SafeContainer from "@/components/SafeContainer";
import ProductList from "@/app/(home)/_components/ProductList";

export default function TabsIndex() {
  return (
    <SafeContainer>
      <ProductList />
      <ScrapeFAB />
    </SafeContainer>
  );
}
