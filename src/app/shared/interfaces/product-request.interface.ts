export interface ProductRequest {
  name: string;
  price: number;
  explanation: string;
  base64Image: string | null;
  categoryId: number;
}
