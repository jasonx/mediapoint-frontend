export function toSnakeCase(input: string = ''): string {
  return input
    .toLowerCase()
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .join('_');
}

export function fromSnakeCase(input: string = ''): string {
  return input.toLowerCase().replace(/_/g, ' ');
}
