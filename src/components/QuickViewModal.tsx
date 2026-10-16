import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (id: number) => void;
  onOpenMakerProfile?: (makerName: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (product) {
      onClose();
      navigate(`/product/${product.id}`);
    }
  }, [product, navigate, onClose]);

  return null;
};
