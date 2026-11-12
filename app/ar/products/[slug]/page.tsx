import {
  ProductDetailPageContent,
  generateMetadata as baseMetadata,
  generateStaticParams as baseStaticParams,
} from "@/app/product/[slug]/page";

export { baseMetadata as generateMetadata, baseStaticParams as generateStaticParams };

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArabicProductsDetailPage({ params }: PageProps) {
  return <ProductDetailPageContent params={params} isArabic={true} />;
}
