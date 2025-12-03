import { titleCase } from './title-case';

export function transformSelectList(statusObj: Object): string[] {
  return Object.values(statusObj).map((s) => titleCase(s));
}
