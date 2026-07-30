import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';

interface Product {
  id: number;
  name: string;
  price: number;
  explanation: string;
  categoryId: number;
  categoryName: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  products = signal<Product[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.http.get<Product[]>('http://localhost:8081/api/products').subscribe({
      next: (data) => {
        console.log('Gelen ürünler:', data);

        this.products.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Ürünler alınamadı:', error);

        this.errorMessage.set('Ürünler yüklenirken bir hata oluştu.');

        this.loading.set(false);
      },
    });
  }
}
