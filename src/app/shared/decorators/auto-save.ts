// src: https://github.com/AlexanderZhelnin/angular-sat-common/blob/main/projects/sat-common/src/lib/forms/auto-save.ts

import { OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { debounceTime, Observable, Subscription } from 'rxjs';

/**
 * Декоратор для збереження даних форми
 * @param key Ключ для збереження даних форми
 * @param [storage=localStorage] Сховище, за замовчуванням це localStorage
 * @param [parse=JSON.parse] Перетворювач у рядок <string>
 * @param [stringify=JSON.stringify] Перетворювач з рядка <string>
 */
export function autoSave(
  key: string | Promise<string> | Observable<string>,
  storage: Storage = localStorage,
  parse: (
    text: string,
    reviver?: (this: any, key: string, value: any) => any
  ) => any = JSON.parse,
  stringify: (
    value: any,
    replacer?: (this: any, key: string, value: any) => any,
    space?: string | number
  ) => string = JSON.stringify
): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const view = target as OnDestroy;
    let subs: Subscription | undefined;
    const originalOnDestroy = view.ngOnDestroy;

    view.ngOnDestroy = function () {
      subs?.unsubscribe();
      originalOnDestroy?.apply(this);
    };

    let val = (target as { [key: string | symbol]: any })[propertyKey];

    const getter = () => val;
    const setter = (v: FormGroup) => {
      subs?.unsubscribe();
      val = v;

      if (!v) return;

      if (typeof key === 'string')
        subs = createSetter(storage, key, v, parse, stringify, subs);
      else if (key instanceof Observable)
        key.subscribe({
          next: (k) =>
            (subs = createSetter(storage, k, v, parse, stringify, subs)),
        });
      else {
        key.then(
          (k) => (subs = createSetter(storage, k, v, parse, stringify, subs))
        );
      }
    };

    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
    });
  };
}

function createSetter(
  storage: Storage,
  key: string,
  v: FormGroup,
  parse: (
    text: string,
    reviver?: (this: any, key: string, value: any) => any
  ) => any,
  stringify: (
    value: any,
    replacer?: (this: any, key: string, value: any) => any,
    space?: string | number
  ) => string,
  subs: Subscription | undefined
) {
  subs?.unsubscribe();
  const oldValue = storage.getItem(key);

  if (!!oldValue) v.patchValue(parse(oldValue) as { [key: string]: any });

  return v.valueChanges
    .pipe(debounceTime(100))
    .subscribe({ next: (ch) => storage.setItem(key, stringify(ch)) });
}

export function autoSaveClear(
  key: string | Promise<string> | Observable<string>,
  storage: Storage = localStorage
): void {
  if (typeof key === 'string') storage.removeItem(key);
  else if (key instanceof Observable)
    key.subscribe({ next: (k) => storage.removeItem(k) });
  else {
    key.then((k) => storage.removeItem(k));
  }
}

export function field(storage: FormGroup, name: string): string {
  return storage.get(name)?.value ? storage.get(name)?.value : '';
}
