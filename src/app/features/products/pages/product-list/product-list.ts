import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
  readonly categories = signal<Category[]>([]);

  readonly searchText = signal('');
  readonly selectedCategoryId = signal(0);

  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly filteredProducts = computed(() => {
    const searchValue = this.searchText().trim().toLocaleLowerCase('tr-TR');

    const categoryId = this.selectedCategoryId();

    return this.products().filter((product) => {
      const matchesSearch =
        searchValue.length === 0 ||
        product.name.toLocaleLowerCase('tr-TR').includes(searchValue) ||
        product.categoryName.toLocaleLowerCase('tr-TR').includes(searchValue) ||
        product.explanation?.toLocaleLowerCase('tr-TR').includes(searchValue);

      const matchesCategory = categoryId === 0 || product.categoryId === categoryId;

      return matchesSearch && matchesCategory;
    });
  });

  ngOnInit(): void {
    this.loadPageData();
  }

  updateSearchText(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchText.set(input.value);
  }

  updateCategory(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedCategoryId.set(Number(select.value));
  }

  clearFilters(): void {
    this.searchText.set('');
    this.selectedCategoryId.set(0);
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
