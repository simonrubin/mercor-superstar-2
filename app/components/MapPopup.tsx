import Image from "next/image";
import React from "react";
import Fab from "@mui/material/Fab";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import PublicIcon from "@mui/icons-material/Public";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";

export interface Business {
  id: string;
  name: string;
  star_rating: number;
  review_count: number;
  phone: string;
  address: string;
  longitude: number;
  latitude: number;
  contacted: string;
  interested: string;
  thumbnail: string;
  website: string;
}

export default function MapPopup(business: Business) {
  return (
    <div className="flex flex-row items-center min-h-36 gap-0 max-w-full overflow-hidden">
      <div className="flex flex-1 flex-col p-3 gap-1">
        {/* business name and rating, left aligned */}
        <div className="flex gap-2">
          <div className="truncate max-w-[200px]">
            <span className="text-base font-medium">{business?.name}</span>
          </div>

          {/* vertically align items */}
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500">
              {business.star_rating}
            </span>
            <Rating
              name="text-feedback"
              size="small"
              value={business.star_rating}
              readOnly
              precision={0.5}
              emptyIcon={
                <StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />
              }
            />
            <span className="text-sm text-gray-500">
              ({business.review_count})
            </span>
          </div>
        </div>

        {/* Address */}
        <div className="group flex justify-between items-center text-sm text-gray-500">
          <div
            className="flex items-center truncate"
            style={{ maxWidth: "320px" }}
          >
            <LocationOnOutlinedIcon
              sx={{
                fontSize: 16,
                color: "rgb(26, 115, 232)",
                marginRight: "8px",
              }}
            />
            {business?.address && business?.address != "" ? (
              <div className="truncate">
                <span title={business?.address}>{business?.address}</span>
              </div>
            ) : (
              "-"
            )}
          </div>
          {business?.address && business?.address !== "" && (
            <span className="hidden group-hover:block">
              <ContentCopyRoundedIcon
                sx={{
                  fontSize: 16,
                  color: "rgb(26, 115, 232)",
                }}
                onClick={() => navigator.clipboard.writeText(business.address)}
                className="cursor-pointer transition-all ease-in-out hover:bg-white rounded-full hover:text-blue-500 hover:shadow-md size-full hover:scale-150 hover:p-0.5"
              />
            </span>
          )}
        </div>

        {/* Website */}
        <div className="group flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center">
            <PublicOutlinedIcon
              sx={{
                fontSize: 16,
                color: "rgb(26, 115, 232)",
                marginRight: "8px",
              }}
            />

            {business?.website && business?.website != "" ? (
              <a href={business.website} target="_blank" rel="noreferrer">
                <div className="truncate max-w-[320px]">
                  <span className="hover:underline">
                    {/* cut off website at the question mark */}
                    {business.website.split("?")[0]}
                  </span>
                </div>
              </a>
            ) : (
              "-"
            )}
          </div>

          {business?.website && business?.website !== "" && (
            <span className="hidden group-hover:block">
              <ContentCopyRoundedIcon
                sx={{
                  fontSize: 16,
                  color: "rgb(26, 115, 232)",
                }}
                onClick={() => navigator.clipboard.writeText(business.website)}
                className="cursor-pointer transition-all ease-in-out hover:bg-white rounded-full hover:text-blue-500 hover:shadow-md size-full hover:scale-150 hover:p-0.5"
              />
            </span>
          )}
        </div>

        {/* Phone */}
        <div className="group flex justify-between items-center text-sm text-gray-500">
          <div
            className="flex items-center truncate"
            style={{ maxWidth: "250px" }}
          >
            <PhoneIcon
              sx={{
                fontSize: 16,
                color: "rgb(26, 115, 232)",
                marginRight: "8px",
              }}
            />
            {business?.phone != "" ? business.phone : "-"}
          </div>
          {business?.phone && business?.phone !== "" && (
            <span className="hidden group-hover:block">
              <ContentCopyRoundedIcon
                sx={{
                  fontSize: 16,
                  color: "rgb(26, 115, 232)",
                }}
                onClick={() => navigator.clipboard.writeText(business.phone)}
                className="cursor-pointer transition-all ease-in-out hover:bg-white rounded-full hover:text-blue-500 hover:shadow-md size-full hover:scale-150 hover:p-0.5"
              />
            </span>
          )}
        </div>
      </div>

      {/* Image on Right */}
      {business?.thumbnail ? (
        <div className="relative aspect-square w-36 m-4 min-w-36">
          <Image
            className="popup-img absolute inset-0 h-full w-full object-cover rounded-lg"
            src={business.thumbnail}
            width={120} 
            height={120}
            alt={business?.name}
            loading="lazy"
          />
        </div>
      ) : (
        <div className="h-36 w-36 bg-zinc-400 m-4 rounded-lg"></div>
      )}
    </div>
  );
}
