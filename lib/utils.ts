export const unique = <T>(arr: T[]) => {
  // Objects can be complex, so we can't use Set here
  return arr.filter(
    (v, i, a) =>
      a.findIndex((t) => JSON.stringify(t) === JSON.stringify(v)) === i
  );
};
