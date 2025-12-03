export function onlyNumberMask(
  value: string | number = '',
  isFractional?: boolean
): string {
  const regex = isFractional ? /[^0-9.]+/g : /[^0-9]+/g;

  return value?.toString().replace(regex, '');
}

export function numberMask(value: string | number = ''): string {
  const numberRegex = /(\d)(?=(\d{3})+\b)/g;

  value = onlyNumberMask(value);
  value = value.toString().replace(numberRegex, '$1 ');

  return value;
}

export function numberSizeMask(value: string | number = ''): string {
  value = value.toString();
  const isDelete = value.search(/\sm$/g) != -1;

  value = isDelete ? numberMask(value).slice(0, -1) : numberMask(value);
  value = value ? value + ' mm' : value;

  return value;
}

export function withoutLettersMask(value: string = ''): string {
  const letterRegex = /[a-zA-z]+/g;

  if (value.toString().search(letterRegex) != -1) {
    return value.toString().replace(letterRegex, '');
  }

  return value;
}

export function phoneMask(value: string = ''): string {
  if (!value) {
    return '';
  }

  let newVal = value.replace(/\D/g, '').substring(0, 10);

  return newVal;
}
