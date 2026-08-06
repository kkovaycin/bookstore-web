import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Category } from '../../../../shared/interfaces/category.interface';
import { ProductRequest } from '../../../../shared/interfaces/product-request.interface';
import { CategoryService } from '../../../../shared/services/category.service';
import { ProductService } from '../../../../shared/services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly maximumImageSize = 2 * 1024 * 1024;

  readonly categories = signal<Category[]>([]);
  readonly selectedImage = signal<string | null>(null);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly imageErrorMessage = signal('');

  readonly productId = signal<number | null>(null);

  readonly isEditMode = signal(false);

  readonly productForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    explanation: ['', [Validators.maxLength(5000)]],
    categoryId: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    const idParameter = this.activatedRoute.snapshot.paramMap.get('id');

    if (idParameter) {
      const id = Number(idParameter);

      if (!Number.isNaN(id)) {
        this.productId.set(id);
        this.isEditMode.set(true);
      }
    }

    this.loadFormData();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.imageErrorMessage.set('');

    if (!file.type.startsWith('image/')) {
      this.imageErrorMessage.set('Please select a valid image file.');

      input.value = '';
      return;
    }

    if (file.size > this.maximumImageSize) {
      this.imageErrorMessage.set('The image size cannot exceed 2 MB.');

      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        this.imageErrorMessage.set('The image could not be read.');
        return;
      }

      this.selectedImage.set(reader.result);
    };

    reader.onerror = () => {
      this.imageErrorMessage.set('The image could not be read.');
    };

    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedImage.set(null);
    this.imageErrorMessage.set('');
  }

  submit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.getRawValue();

    const request: ProductRequest = {
      name: formValue.name.trim(),
      price: formValue.price,
      explanation: formValue.explanation.trim(),
      base64Image: this.selectedImage(),
      categoryId: formValue.categoryId,
    };

    this.saving.set(true);
    this.errorMessage.set('');

    const productId = this.productId();

    const requestObservable =
      this.isEditMode() && productId !== null
        ? this.productService.updateProduct(productId, request)
        : this.productService.createProduct(request);

    requestObservable.subscribe({
      next: (product) => {
        this.saving.set(false);

        void this.router.navigate(['/products', product.id]);
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);

        if (error.status === 401) {
          this.errorMessage.set('You must sign in to perform this operation.');
          return;
        }

        if (error.status === 403) {
          this.errorMessage.set('You do not have permission to perform this operation.');
          return;
        }

        if (error.status === 400) {
          this.errorMessage.set('Please check the product information.');
          return;
        }

        this.errorMessage.set('The product could not be saved. Please try again.');
      },
    });
  }

  private loadFormData(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const productId = this.productId();

    if (!this.isEditMode() || productId === null) {
      this.categoryService.getAllCategories().subscribe({
        next: (categories) => {
          this.categories.set(categories);
          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set('Categories could not be loaded.');

          this.loading.set(false);
        },
      });

      return;
    }

    forkJoin({
      categories: this.categoryService.getAllCategories(),

      product: this.productService.getProductById(productId),
    }).subscribe({
      next: ({ categories, product }) => {
        this.categories.set(categories);

        this.productForm.patchValue({
          name: product.name,
          price: product.price,
          explanation: product.explanation ?? '',
          categoryId: product.categoryId,
        });

        this.selectedImage.set(product.base64Image);

        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Product information could not be loaded.');

        this.loading.set(false);
      },
    });
  }
}
