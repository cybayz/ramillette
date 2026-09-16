import ProductDetailPage, { generateMetadata as baseMetadata } from "@/app/product/[slug]/page";

export { baseMetadata as generateMetadata };

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArabicProductsDetailPage({ params }: PageProps) {
  return <ProductDetailPage params={params} isArabic={true} />;
}
