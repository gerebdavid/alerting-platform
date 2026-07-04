import type { AlertCategory } from "../enums.js";

export interface CategoryResponse {
  id: string;
  code: AlertCategory;
  label: string;
}
