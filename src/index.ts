import { ActionCreatorsMapObject, Reducer, combineReducers } from 'redux';


export type Selector<S = any, T = any> = (state: S, args?: any[]) => T;
export interface SelectorsMapObject {
  [key: string]: Selector
}

export interface DuckModule<S = any> {
  name: string,
  reducer: Reducer,
  actions: ActionCreatorsMapObject,
  selectors: SelectorsMapObject,
}

export interface DuckModulesObjectMap {
  [key: string]: DuckModule
}

function wrapSelector(selector: Selector, scopeName: string): Selector {
  return (state: any, ...args: any[]) => selector(state[scopeName], [args]);
}

function wrapSelectors<S = any>(selectors: SelectorsMapObject, scopeName: string): SelectorsMapObject {
  return Object.keys(selectors).reduce((wrapped, key) => {
    wrapped[key] = wrapSelector(selectors[key], scopeName);
    return wrapped;
  }, {} as SelectorsMapObject);
}

export function createModule(
  name: string,
  reducer: Reducer,
  actions: ActionCreatorsMapObject,
  selectors: SelectorsMapObject,
): DuckModule {
  return {
    name,
    reducer,
    actions,
    selectors: wrapSelectors(selectors, name)
  }
}

export function combineModuleReducers(modules: DuckModule[] | DuckModulesObjectMap): Reducer {
  const moduleIterator = Array.isArray(modules) ? modules : Object.keys(modules).map(key => modules[key]);

  const reducers = moduleIterator.reduce((o, m) => ({ ...o, [m.name]: m.reducer }), {});

  return combineReducers(reducers);
}
