import type { CategoriesCardProps } from "@/types/categoriesCard";
import goBackIcon from "../../assets/icons/goBackIcon.svg";

export function CategoriesCard({
  title,
  children,
  onBack,
  rightIcon,
  bottomImages,
}: CategoriesCardProps) {
  return (
    <div className="categoriesCard">
      <div className="categoriesHeader">
        {onBack && (
          <img
            src={goBackIcon}
            alt="Go back"
            className="categoriesBackButton"
            onClick={onBack}
          />
        )}
        <h1>{title}</h1>
        {rightIcon && <div className="categoriesRightIcon">{rightIcon}</div>}
      </div>

      {children}

      {bottomImages && bottomImages.length > 0 && (
        <div className="categoriesBottomImages">
          {bottomImages.map((img, index) => (
            <img key={index} src={img} alt={`Decoration ${index + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}
