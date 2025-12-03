export function removeEmptyFromObj(obj: any): any {
  return Object.entries(obj).reduce((a: any, [key, value]: any) => {
    return isValue(value)
      ? Array.isArray(value)
        ? ((a[key] = value.map((v) => removeEmptyFromObj(v))), a)
        : ((a[key] = value), a)
      : a;
  }, {});
}

export function isValue(value: any): boolean {
  return (
    (value || value === 0 || typeof value == 'boolean') && !isEmptyObj(value)
  );
}

export function isEmptyObj(value: any): boolean {
  return (
    typeof value == 'object' &&
    value !== null &&
    Object.keys(value).length === 0
  );
}
