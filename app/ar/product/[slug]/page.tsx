import ProductDetailPage, {
  generateMetadata as baseMetadata,
  generateStaticParams as baseStaticParams,
} from "@/app/product/[slug]/page";

export { baseMetadata as generateMetadata, baseStaticParams as generateStaticParams };

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArabicProductDetailPage({ params }: PageProps) {
  return <ProductDetailPage params={params} isArabic={true} />;
}
