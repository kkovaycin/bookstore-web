import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Product } from '../../../../shared/interfaces/product.interface';
import { ProductService } from '../../../../shared/services/product.service';
import { Loading } from '../../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, Loading, ErrorMessage],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly quantity = signal(1);
  readonly addedToCart = signal(false);

  ngOnInit(): void {
    const productId = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(productId) || productId <= 0) {
      this.errorMessage.set('Invalid product id.');

      this.loading.set(false);
      return;
    }

    this.loadProduct(productId);
  }

  increaseQuantity(): void {
    this.quantity.update((currentQuantity) => currentQuantity + 1);
  }

  decreaseQuantity(): void {
    this.quantity.update((currentQuantity) => (currentQuantity > 1 ? currentQuantity - 1 : 1));
  }

  addToCart(): void {
    this.addedToCart.set(true);

    setTimeout(() => {
      this.addedToCart.set(false);
    }, 2500);
  }

  private loadProduct(productId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },

      error: () => {
        this.errorMessage.set('Product could not be loaded.');

        this.loading.set(false);
      },
    });
  }
}
