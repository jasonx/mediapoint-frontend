//TODO: delete
import { toKebabCase } from './kebab-case';

export function carve(input: string, value: string): string {
  return input.replace(value, '');
}

export function toRoute(input: string): string {
  return toKebabCase(carve(input, 'Component'));
}
