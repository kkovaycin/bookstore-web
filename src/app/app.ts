import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';

import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';

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
  imports: [CommonModule, CardModule, MessageModule, ProgressSpinnerModule, TagModule],
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

  loadProducts(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.http.get<Product[]>('http://localhost:8081/api/products').subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Ürünler yüklenirken hata oluştu:', error);
        this.errorMessage.set('Ürünler yüklenirken bir hata oluştu.');
        this.loading.set(false);
      },
    });
  }
}
