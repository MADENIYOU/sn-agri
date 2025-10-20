
import React from "react";
import "./culture-display.css";
import CultureItem from "@/components/culture-item/CultureItem";
import { cultureDisplay_list } from "@/lib/culture-data";

interface CultureDisplayProps {
    category: string;
}

const CultureDisplay: React.FC<CultureDisplayProps> = ({ category }) => {
  const filteredList = category === "All"
      ? cultureDisplay_list
      : cultureDisplay_list.filter((item) => item.type === category);

  return (
    <div className="culture-display">
      <h1 className="culture-heading">Top cultures près de chez vous</h1>
      <div className="culture-grid">
        {filteredList.map((item) => (
          <CultureItem
            key={item.culture_id}
            {...item}
          />
        ))}
      </div>
    </div>
  );
};

export default CultureDisplay;
