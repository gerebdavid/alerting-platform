import type { CategoryResponse } from "@app/shared";
import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "@/lib/api";

export const useCategoriesStore = defineStore("categories", () => {
  const categories = ref<CategoryResponse[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchCategories(force = false) {
    if (categories.value.length && !force) return;
    isLoading.value = true;
    error.value = null;
    try {
      categories.value = await api.get<CategoryResponse[]>("/api/categories");
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load categories";
    } finally {
      isLoading.value = false;
    }
  }

  return { categories, isLoading, error, fetchCategories };
});
