import { api } from "@/lib/api";

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Foto do produto do dono, como data URL. Passa pelo axios (não por `<img src>`)
 * pra o interceptor renovar o access token expirado.
 */
export async function getShowcaseProductPhotoRequest(
  productId: string
): Promise<string> {
  const response = await api.get<Blob>(
    `/showcase/products/${productId}/photo`,
    { responseType: "blob" }
  );

  return blobToDataUrl(response.data);
}
