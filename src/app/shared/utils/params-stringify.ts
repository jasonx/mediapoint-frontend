import { fromCamel } from './camel';

export function paramsStringify(params: any): string {
  return (
    '?' +
    Object.keys(params)
      .map((key) => fromCamel(key) + '=' + params[key])
      .join('&')
  );
}
