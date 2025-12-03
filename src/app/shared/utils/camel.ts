export function toCamel(value: string = ''): string {
  return value.replace(/([-_]([a-z]|[0-9]))/gi, ($1) => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  });
}

export function toCamelObj(obj: any): any {
  return obj
    ? Array.isArray(obj)
      ? toCamelArray(obj)
      : Object.fromEntries(
          Object.entries(obj).map(([key, value]) => [
            toCamel(key),
            typeof value === 'object' ? toCamelObj(value) : value,
          ])
        )
    : obj;
}

export function toCamelArray(arr: any): any[] | null {
  return arr?.length
    ? arr.map((v: any) => (typeof v === 'object' ? toCamelObj(v) : v))
    : arr;
}

export function fromCamel(value: string): string {
  return value
    .replace(/\.?([A-Z]+|[0-9])/g, ($1, $2) => {
      return '_' + $2.toLowerCase();
    })
    .replace(/^_/, '');
}

export function fromCamelObj(obj: any): { [key: string]: any } | null {
  return obj
    ? Array.isArray(obj)
      ? fromCamelArray(obj)
      : Object.fromEntries(
          Object.entries(obj).map(([key, value]) => [
            fromCamel(key),
            typeof value === 'object' ? fromCamelObj(value) : value,
          ])
        )
    : obj;
}

export function fromCamelArray(arr: any): any[] | null {
  return arr?.length
    ? arr.map((v: any) => (typeof v === 'object' ? fromCamelObj(v) : v))
    : arr;
}
