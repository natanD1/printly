import { api } from "@/lib/api";

export async function removeShowcaseItemRequest(
  productId: string
): Promise<void> {
  await api.delete(`/showcase/items/${productId}`);
}
