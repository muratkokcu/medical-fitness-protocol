import React, { useEffect } from 'react';
import './DeleteConfirmationModal.css';
import TrashIcon from '../icons/TrashIcon';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Sil",
  cancelText = "İptal",
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel, isLoading]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onCancel();
    }
  };

  return (
    <div className="delete-modal-backdrop" onClick={handleBackdropClick}>
      <div className="delete-modal">
        <div className="delete-modal-icon">
          <TrashIcon size={32} />
        </div>
        
        <div className="delete-modal-content">
          <h3 className="delete-modal-title">{title}</h3>
          <p className="delete-modal-message">{message}</p>
        </div>
        
        <div className="delete-modal-actions">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="btn-modal-confirm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Siliniyor...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;