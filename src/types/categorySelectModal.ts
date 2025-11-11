export interface CategorySelectModalProps {
  isOpen: boolean;
  onSelect: (categoryId: number, categoryName: string) => void;
  onClose: () => void;
  filename: string;
  isSubmitting?: boolean;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}
