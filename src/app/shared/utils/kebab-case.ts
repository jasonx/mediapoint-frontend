export function toKebabCase(input: string): string {
  return input.replace(/([a-z])([A-Z])|\s|\_/g, '$1-$2').toLowerCase();
}
