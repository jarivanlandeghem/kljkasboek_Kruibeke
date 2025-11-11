import CategoryDropdown from "../components/categories/CategoryDropdown";
import Navbar from "../components/Navbar";
export default function CategoriesPage(){
  return(
    <div>
      <Navbar/>
        <CategoryDropdown/>
    </div>
  );
}