import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { ProductCard } from '../../components/product-card/product-card';
import { Product } from '../../../../shared/interfaces/product.interface';
import { Category } from '../../../../shared/interfaces/category.interface';
import { ProductService } from '../../../../shared/services/product.service';
import { CategoryService } from '../../../../shared/services/category.service';
import { Loading } from '../../../../shared/components/loading/loading';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ProductCard, Loading, ErrorMessage],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  private readonly productService = inject(ProductService);

  private readonly categoryService = inject(CategoryService);

  readonly products = signal<Product[]>([]);
  readonly allProducts = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);

  readonly searchText = signal('');
  readonly selectedCategoryId = signal(0);

  readonly loading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadPageData();
  }

  updateSearchText(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchText.set(input.value);
    this.searchProducts();
  }

  updateCategory(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.selectedCategoryId.set(Number(input.value));

    this.searchProducts();
  }

  clearFilters(): void {
    this.searchText.set('');
    this.selectedCategoryId.set(0);
    this.products.set(this.allProducts());
    this.errorMessage.set('');
  }

  getCategoryProductCount(categoryId: number): number {
    return this.allProducts().filter((product) => product.categoryId === categoryId).length;
  }

  private searchProducts(): void {
    const categoryId = this.selectedCategoryId();

    const categoryIds = categoryId === 0 ? [] : [categoryId];

    if (!this.searchText().trim() && categoryIds.length === 0) {
      this.products.set(this.allProducts());
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.productService.searchProducts(this.searchText(), categoryIds).subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Products could not be filtered. Please try again.');

        this.loading.set(false);
      },
    });
  }

  private loadPageData(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      products: this.productService.getAllProducts(),
      categories: this.categoryService.getAllCategories(),
    }).subscribe({
      next: ({ products, categories }) => {
        this.products.set(products);
        this.allProducts.set(products);
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Products could not be loaded. Please check the backend connection.');

        this.loading.set(false);
      },
    });
  }
}
