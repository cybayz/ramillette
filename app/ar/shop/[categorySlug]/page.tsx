import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    categorySlug: string;
  }>;
}

export default async function ArabicShopRedirectPage({ params }: PageProps) {
  const { categorySlug } = await params;
  redirect(`/ar/collections/${categorySlug}`);
}
