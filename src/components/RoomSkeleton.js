import React, { memo } from 'react';

const RoomSkeleton = memo(() => {
  return (
    <article className="room skeleton">
      <div className="img-container skeleton-img">
        <div className="skeleton-shimmer"></div>
      </div>
      <div className="skeleton-text">
        <div className="skeleton-line skeleton-shimmer"></div>
      </div>
    </article>
  );
});

const RoomSkeletonList = memo(({ count = 6 }) => {
  return (
    <section className="roomslist">
      <div className="roomslist-center">
        {Array.from({ length: count }).map((_, index) => (
          <RoomSkeleton key={index} />
        ))}
      </div>
    </section>
  );
});

export { RoomSkeleton, RoomSkeletonList };
export default RoomSkeletonList;
