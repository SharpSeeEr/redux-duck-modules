# Redux Duck Modules

A package help organize actions, reducers, and selectors together into modules, inspired by [ducks](https://github.com/erikras/ducks-modular-redux).

## Duck Modules

A standard redux app consists of action type constants, action creators, and reducers.  Selectors are created within react components. These are typically defined in separate files, sometimes in different folders.

A Duck Module combines the logic around a specific data set together, meaning the action types, action creators,reducers, and selectors that deal with the data are defined together, typically in the same file.  The `createModule` function combines and wraps these parts together to provide a single object to export that contains the reducer, actions and selectors.  Connected components are able to easily import and use the module.

## Rules

- **Each module is only aware of it's own state.** Modules don't care or know about each other's state.
- **Each module defnes how its state is structured.** You define all actions, reducers, and selectors in each module that manipulate and retrieve data from that modules state.
- **Connected components should not assume to know how the store is structured.** When creating connected components, there is no need to directly reference the state.  Instead import actions and selectors from each module.  This keeps the logic of how the state is structured inside the module - the component doesn't need to know the path through the state.  As a bonus, connected components don't need to be updated when the structure of the store is changed.

## API Reference

### `createModule(name, reducer, actions, selectors)`

- **name** - the name of the module, used primarily when combining reducers from multiple modules.
- **reducer** - the reducer function for the module.
- **actions** - an object map of action creators
- **selectors** - an object map of selectors

Returns a Duck Module object suitable for exporting.  The passed in selectors are wrapped so proper scope is applied when used.


### `combineModuleReducers(modules)`

- **modules** - an array of all modules

Returns a combined reducer for passing to redux's `createStore()` function.  Internally utilizes `combineReducers()`.

## Example

`chips.js`

``` javascript
import { createModule} from 'redux-duck-modules';

const initialState = {
  favorite: '',
  forSale: ['BBQ', 'Sea Salt', 'Plain', 'Jalepeno']
};

const SET_FAVORITE_CHIPS = 'SET_FAVORITE_CHIPS';
const SET_CHIPS_FOR_SALE = 'SET_CHIPS_FOR_SALE';

const setFavorite = favorite => { type: SET_FAVORITE_CHIPS, payload: favorite };
const setForSale = chipsList => { type: SET_FAVORITE_CHIPS, payload: chipsList };

const getFavorite = state => state.favorite;
const getForSale = state => state.forSale;

const reducer = function(state = initialState, action) {
  switch (action.type) {
    case SET_FAVORITE_CHIPS:
      return { ...state, favorite: action.payload };
    case SET_CHIPS_FOR_SALE:
      return { ...state, forSale: action.payload };
    default:
      return state;
  }
}

export const chips = createModule(
  'chips',
  reducer,
  { setFavorite, setForSale },
  { getFavorite, getForSale }
);

export default reducer;
```

`drinks.js` - Utilizes `redux-reducer-handlers` for alternate reducer definition.

``` javascript
import { createModule} from 'redux-duck-modules';
import createReducer from 'redux-reducer-handlers';

const initialState = {
  favorite: '',
  forSale: ['Soda', 'Lemonade', 'Iced Tea', 'Coffee']
};

const SET_FAVORITE_DRINKS = 'SET_FAVORITE_DRINKS';
const SET_DRINKS_FOR_SALE = 'SET_DRINKS_FOR_SALE';

const setFavorite = favorite => { type: SET_FAVORITE_DRINKS, payload: favorite };
const setForSale = drinksList => { type: SET_DRINKS_FOR_SALE, payload: drinksList };

const getFavorite = state => state.favorite;
const getForSale = state => state.forSale;

const handlers = {
  [SET_FAVORITE_DRINKS]: (draft, action) => {
    draft.favorite = action.payload;
  },
  [SET_DRINKS_FOR_SALE]: (draft, action) => {
    draft.forSale = action.payload;
  }
}

const reducer = createReducer(initialState, handlers);
export const drinks = createModule(
  'drinks',
  reducer,
  { setFavorite, setForSale }, // actions
  { getFavorite, getForSale }  // selectors
);

export default reducer;
```

`store.js`

``` javascript
import { createStore } from 'redux';
import { combineModuleReducers } from 'redux-duck-modules';
import drinks from './drinks';
import chips from './chips';

const rootReducer = combineModuleReducers([drinks, chips]);

const store = createStore(rootReducer);

export default store;
```

`ChipsList.jsx` - A connected component

``` jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { chips } from './chips';

const ChipsList = () => {
  const dispatch = useDispatch();

  const chipsList = useSelector(chips.selectors.getForSale);
  const favorite = useSelector(chips.selectors.getFavorite);

  const handleClick = (item) => {
    dispatch(chips.actions.setFavorite(item));
  }

  return (
    <div>
      {favorite && <h3>{favorite} is your favorite kind of chips!</h3>}
      {chipsList.map(item => <div onClick={() => handleClick(item)}>{item}</div>)}
    </div>
  );
}
