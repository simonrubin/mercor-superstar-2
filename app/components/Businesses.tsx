import MapPopup from "./MapPopup";
import Markdown from "react-markdown";
import { Business } from "./MapPopup";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";

interface BusinessesProps {
  businesses: Business[];
  message: string;
  onSelect: (business?: Business) => void;
}

export const PageSize = 5;

export default function Businesses({
  businesses,
  message,
  onSelect,
}: BusinessesProps) {
  const [pagedBusinesses, setPagedBusinesses] = useState<Business[]>(
    businesses.slice(0, PageSize)
  );
  const [pageIndex, setPageIndex] = useState(0);

  const onPage = (direction: number) => {
    const newPageIndex = pageIndex + direction;
    setPageIndex(newPageIndex);
    const start = newPageIndex * PageSize;
    const end = start + PageSize;
    setPagedBusinesses(businesses.slice(start, end));

    // Get the businesses for the new page
    const newPagedBusinesses = businesses.slice(start, end);

    // Update state with the new page's businesses
    setPagedBusinesses(newPagedBusinesses);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center" style={{ maxWidth: "500px" }}>
        <span className="text-balance">{message}</span>
      </div>
      {pagedBusinesses.map((business: Business) => (
        <div
          className="hover:bg-gray-200 border-b-2"
          key={business.id}
          onMouseEnter={() => onSelect(business)}
          onMouseLeave={() => onSelect(undefined)}
        >
          <MapPopup {...business} />
        </div>
      ))}
      {businesses.length > 0 && (
        <div className="self-center">
          <IconButton
            aria-label="delete"
            size="medium"
            onClick={() => onPage(-1)}
            disabled={pageIndex == 0}
          >
            <NavigateBeforeIcon fontSize="inherit" />
          </IconButton>
          {/* include page numbers */}

          <span className="text-sm text-gray-500">
            {pageIndex + 1} of {Math.ceil(businesses.length / PageSize)}
          </span>

          <IconButton
            aria-label="delete"
            size="medium"
            onClick={() => onPage(1)}
            disabled={pageIndex == Math.ceil(businesses.length / PageSize) - 1}
          >
            <NavigateNextIcon fontSize="inherit" />
          </IconButton>
        </div>
      )}
    </div>
  );
}
