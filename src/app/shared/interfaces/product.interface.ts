export interface Product {
  id: number;
  name: string;
  price: number;
  explanation: string | null;
  categoryId: number;
  categoryName: string;
}
