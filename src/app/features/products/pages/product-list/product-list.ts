import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  Subject,
} from 'rxjs';

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
  imports: [
    ProductCard,
    Loading,
    ErrorMessage,
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  private readonly productService =
    inject(ProductService);

  private readonly categoryService =
    inject(CategoryService);

  private readonly destroyRef =
    inject(DestroyRef);

  private readonly searchSubject =
    new Subject<string>();

  readonly products = signal<Product[]>([]);
  readonly allProducts = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);

  readonly searchText = signal('');
  readonly selectedCategoryId = signal(0);

  readonly loading = signal(true);
  readonly filtering = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.configureSearch();
    this.loadPageData();
  }

  updateSearchText(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    this.searchText.set(input.value);

    this.searchSubject.next(
      input.value.trim(),
    );
  }

  updateCategory(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    this.selectedCategoryId.set(
      Number(input.value),
    );

    this.searchProducts();
  }

  clearFilters(): void {
    this.searchText.set('');
    this.selectedCategoryId.set(0);
    this.products.set(this.allProducts());
    this.errorMessage.set('');
    this.filtering.set(false);

    this.searchSubject.next('');
  }

  getCategoryProductCount(
    categoryId: number,
  ): number {
    return this.allProducts().filter(
      (product) =>
        product.categoryId === categoryId,
    ).length;
  }

  private configureSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.searchProducts();
      });
  }

  private searchProducts(): void {
    const categoryId =
      this.selectedCategoryId();

    const categoryIds =
      categoryId === 0
        ? []
        : [categoryId];

    const normalizedSearchText =
      this.searchText().trim();

    if (
      !normalizedSearchText &&
      categoryIds.length === 0
    ) {
      this.products.set(
        this.allProducts(),
      );

      this.errorMessage.set('');
      this.filtering.set(false);
      return;
    }

    this.filtering.set(true);
    this.errorMessage.set('');

    this.productService
      .searchProducts(
        normalizedSearchText,
        categoryIds,
      )
      .subscribe({
        next: (products) => {
          this.products.set(products);
          this.filtering.set(false);
        },
        error: () => {
          this.errorMessage.set(
            'Products could not be filtered. Please try again.',
          );

          this.filtering.set(false);
        },
      });
  }

  private loadPageData(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      products:
        this.productService.getAllProducts(),

      categories:
        this.categoryService.getAllCategories(),
    }).subscribe({
      next: ({ products, categories }) => {
        this.products.set(products);
        this.allProducts.set(products);
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set(
          'Products could not be loaded. Please check the backend connection.',
        );

        this.loading.set(false);
      },
    });
  }
}
