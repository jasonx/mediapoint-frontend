export function singularOrPlural(string: string, value: number): string {
  return `${value} ${string + (value === 1 ? '' : 's')}`;
}