import OrderSuccessPage from "@/app/checkout/success/page";

interface PageProps {
  searchParams: Promise<{ orderNumber?: string }>;
}

export default function ArOrderSuccessPage(props: PageProps) {
  return <OrderSuccessPage {...props} isAr={true} />;
}
