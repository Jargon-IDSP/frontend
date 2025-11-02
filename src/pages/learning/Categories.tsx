import { useNavigate } from "react-router-dom";
import { CategoryFolder } from "@/components/learning/CategoryFolder";
import { useCategories } from "@/hooks/useCategories";
import folderIcon from "../../assets/icons/folderIcon.svg";
import goBackIcon from "../../assets/icons/goBackIcon.svg";

export default function Categories() {
  const navigate = useNavigate();
  const { data: categories, isLoading, error } = useCategories();

  return (
    <div className="categoriesPage">
      <div className="categoriesHeader">
        <img
          src={goBackIcon}
          alt="Go back"
          className="categoriesBackButton"
          onClick={() => navigate(-1)}
        />
        <h1>My Generated Lessons</h1>
        <img src={folderIcon} alt="Folder Icon" className="categoriesFolderIcon" />
      </div>

      {isLoading ? (
        <div className="categoriesLoading">
          Loading categories...
        </div>
      ) : error ? (
        <div className="categoriesError">
          Failed to load categories. Please try again.
        </div>
      ) : (
        <div className="categoriesList">
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <CategoryFolder
                key={category.id}
                categoryId={category.id}
                categoryName={category.name}
                documentCount={category.documentCount}
              />
            ))
          ) : (
            <div className="categoriesEmpty">
              No categories found. Upload a document to create your first lesson!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
