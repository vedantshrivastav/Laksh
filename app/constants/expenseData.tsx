import { Ionicons } from "@expo/vector-icons";
import { Category } from "../storage/useExpenseStore";

export type CategoryItem = {
  id: string;
  name: string;
  category: Category;
  Icon: React.ReactElement;
};

const DATA: CategoryItem[] = [
  {
    id: "1",
    name: "Chai",
    category: "chai",
    Icon: <Ionicons name="cafe" size={17} color="#E8A045" />,
  },
  {
    id: "2",
    name: "Food",
    category: "food",
    Icon: <Ionicons name="restaurant" size={17} color="#E8A045" />,
  },
  {
    id: "3",
    name: "Cab",
    category: "transport",
    Icon: <Ionicons name="car" size={17} color="#E8A045" />,
  },
  {
    id: "4",
    name: "More",
    category: "others",
    Icon: <Ionicons name="card-outline" size={17} color="#E8A045" />,
  },
];
export default DATA;
