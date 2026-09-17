import React from "react";

export default function ProductDetailLoading() {
  return (
    <div className="bg-white min-h-screen pt-6 sm:pt-8 animate-pulse">
      <div className="ramillette-container max-w-[1320px] mx-auto">
        {/* Breadcrumb Skeleton */}
        <div className="mb-6">
          <div className="w-56 h-7 bg-neutral-100 rounded-md" />
        </div>

        {/* Main PDP Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pb-12">
          {/* Left Column: Gallery Skeleton */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col sm:flex-row gap-4">
            <div className="hidden sm:flex flex-col gap-3">
              <div className="w-16 h-16 bg-neutral-100 rounded-lg" />
              <div className="w-16 h-16 bg-neutral-100 rounded-lg" />
              <div className="w-16 h-16 bg-neutral-100 rounded-lg" />
            </div>
            <div className="flex-1 aspect-square bg-neutral-100 rounded-2xl" />
          </div>

          {/* Right Column: Details Skeleton */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-4">
            <div className="w-24 h-4 bg-neutral-100 rounded" />
            <div className="w-3/4 h-8 bg-neutral-100 rounded" />
            <div className="w-32 h-4 bg-neutral-100 rounded" />
            <div className="w-28 h-7 bg-neutral-100 rounded mt-4" />

            {/* Volume selector skeleton */}
            <div className="pt-4 space-y-2">
              <div className="w-20 h-4 bg-neutral-100 rounded" />
              <div className="flex gap-2">
                <div className="w-20 h-10 bg-neutral-100 rounded-lg" />
                <div className="w-20 h-10 bg-neutral-100 rounded-lg" />
                <div className="w-20 h-10 bg-neutral-100 rounded-lg" />
              </div>
            </div>

            {/* Action buttons skeleton */}
            <div className="pt-6 space-y-3">
              <div className="w-full h-12 bg-neutral-200 rounded-lg" />
              <div className="w-full h-12 bg-neutral-100 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
