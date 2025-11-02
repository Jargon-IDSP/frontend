import { useState } from "react";

interface CategorySelectModalProps {
  isOpen: boolean;
  onSelect: (categoryId: number, categoryName: string) => void;
  onClose: () => void;
  filename: string;
}

const categories = [
  { id: 1, name: "Safety", description: "Safety protocols and procedures" },
  { id: 2, name: "Technical", description: "Technical documentation and guides" },
  { id: 3, name: "Training", description: "Training materials and courses" },
  { id: 4, name: "Workplace", description: "Workplace policies and guidelines" },
  { id: 5, name: "Professional", description: "Professional development resources" },
  { id: 6, name: "General", description: "General documents and information" },
];

export function CategorySelectModal({
  isOpen,
  onSelect,
  onClose,
  filename,
}: CategorySelectModalProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSelect = () => {
    if (selectedId) {
      const category = categories.find((c) => c.id === selectedId);
      if (category) {
        onSelect(selectedId, category.name.toLowerCase());
      }
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "2rem",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: "0.5rem", fontSize: "1.5rem", fontWeight: "bold" }}>
          Select a Category
        </h2>
        <p style={{ color: "#6b7280", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          Choose where to organize <strong>{filename}</strong>
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => setSelectedId(category.id)}
              style={{
                border: selectedId === category.id ? "2px solid #3b82f6" : "2px solid #e5e7eb",
                borderRadius: "8px",
                padding: "1rem",
                cursor: "pointer",
                backgroundColor: selectedId === category.id ? "#eff6ff" : "white",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (selectedId !== category.id) {
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedId !== category.id) {
                  e.currentTarget.style.backgroundColor = "white";
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600" }}>
                    {category.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
                    {category.description}
                  </p>
                </div>
                {selectedId === category.id && (
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "1.5rem",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "white",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedId}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: selectedId ? "#3b82f6" : "#d1d5db",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "500",
              cursor: selectedId ? "pointer" : "not-allowed",
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
