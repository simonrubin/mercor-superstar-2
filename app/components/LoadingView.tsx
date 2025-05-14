import Skeleton from "@mui/material/Skeleton";

export default function LoadingView() {
  return (
    <div className="flex h-[calc(100vh-50px)]">
      <div className="relative flex-shrink-0 w-1/2 px-6 pb-6">
        <Skeleton variant="rectangular" height={"100%"} />
      </div>
      <div className="relative flex-shrink-0 w-1/2 px-6 pb-6">
        <Skeleton variant="rectangular" height={40} />
      </div>
    </div>
  );
}
