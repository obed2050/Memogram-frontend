import { useEffect, useRef, useCallback } from 'react';

const useInfiniteScroll = (fetchMore, hasMore, loading) => {
  const observer = useRef(null);

  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            fetchMore();
          }
        },
        { threshold: 0.1 }
      );

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, fetchMore]
  );

  useEffect(() => {
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, []);

  return lastElementRef;
};

export default useInfiniteScroll;
