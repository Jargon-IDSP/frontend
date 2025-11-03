import type { ModalProps } from '../../../types/modal';
import '../../../styles/components/_modal.scss';

export default function Modal({ isOpen, onClose, title, children, maxWidth = '500px' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal__overlay" onClick={onClose}>
      <div
        className="modal__content"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal__title">{title}</h2>
        {children}
      </div>
    </div>
  );
}