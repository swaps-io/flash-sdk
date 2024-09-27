export const isArray = <I, O>(items: readonly I[] | O): items is readonly I[] => {
  return Array.isArray(items);
};

interface NewArrayFunc {
  (length: number): undefined[];
  <I>(length: number, fill: I): I[];
}

export const newArray: NewArrayFunc = <I>(length: number, fill?: I): I[] => {
  return new Array(length).fill(fill) as I[];
};
