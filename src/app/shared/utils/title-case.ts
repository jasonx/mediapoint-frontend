import { capitalizeFirstLetter } from './capitalize-first-letter';

export function titleCase(string: string = ''): string {
  return string
    .split(/[\s_-]+/)
    .map((s) => capitalizeFirstLetter(s))
    .join(' ');
}
