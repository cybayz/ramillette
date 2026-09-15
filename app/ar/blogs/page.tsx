import { redirect } from "next/navigation";

export default function ArabicBlogsIndexRedirect() {
  redirect("/ar/blogs/news");
}
