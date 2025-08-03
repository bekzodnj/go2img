export const isPolygonClosed = (
  points: number[][],
  isLineMode: boolean = false,
) => {
  return points.length >= (isLineMode ? 2 : 3);
  // const first = points[0];
  // const last = points[points.length - 1];
  // return first[0] === last[0] && first[1] === last[1];
};
