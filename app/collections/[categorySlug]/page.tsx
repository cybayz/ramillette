import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ categorySlug: string }>;
}

export default async function CollectionsRedirect({ params }: Props) {
  const { categorySlug } = await params;
  if (categorySlug === "all" || categorySlug === "frontpage") {
    redirect("/shop");
  }
  redirect(`/shop/${categorySlug}`);
}
