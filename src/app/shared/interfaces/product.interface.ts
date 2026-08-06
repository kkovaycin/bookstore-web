export interface Product {
  id: number;
  name: string;
  price: number;
  explanation: string | null;
  base64Image: string | null;
  categoryId: number;
  categoryName: string;
}
