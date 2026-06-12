import { revalidateTag } from "next/cache";

export function revalidateCarsCache(): void {
  revalidateTag("cars");
}
