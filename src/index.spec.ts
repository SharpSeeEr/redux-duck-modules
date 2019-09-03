import { expect } from 'chai';
import { AnyAction, Reducer, combineReducers } from 'redux';
import { createModule, combineModuleReducers } from '.';

interface ModuleState {
  favorite: string,
  forSale: string[]
}

describe('redux-duck-modules', function () {

  const SET_FAVORITE_CHIPS = 'SET_FAVORITE_CHIPS';
  const SET_CHIPS_FOR_SALE = 'SET_CHIPS_FOR_SALE';

  const SET_FAVORITE_DRINKS = 'SET_FAVORITE_DRINKS';
  const SET_DRINKS_FOR_SALE = 'SET_DRINKS_FOR_SALE';

  const chipsModule = {
    name: 'chips',
    actions: {
      setFavorite: (favorite: string) => ({ type: SET_FAVORITE_CHIPS, payload: favorite}),
      setForSale: (chipsList: string[]) => ({ type: SET_CHIPS_FOR_SALE, payload: chipsList })
    },
    selectors: {
      getFavorite: (state: ModuleState) => state.favorite,
      getChipsForSale: (state: ModuleState) => state.forSale
    },
    reducer: (state: ModuleState = {
        favorite: '',
        forSale: ['BBQ', 'Sea Salt', 'Plain', 'Jalepeno']
      }, action: AnyAction) => {
      switch (action.type) {
        case SET_FAVORITE_CHIPS:
          return { ...state, favorite: action.payload };
        case SET_CHIPS_FOR_SALE:
          return { ...state, forSale: action.payload };
        default:
          return state;
      }
    },
  }

  const drinksModule = {
    name: 'drinks',
    actions: {
      setFavorite: (favorite: string) => ({ type: SET_FAVORITE_DRINKS, payload: favorite}),
      setForSale: (drinksList: string[]) => ({ type: SET_DRINKS_FOR_SALE, payload: drinksList })
    },
    selectors: {
      getFavorite: (state: ModuleState) => state.favorite,
      getChipsForSale: (state: ModuleState) => state.forSale
    },
    reducer: (state: ModuleState = {
        favorite: 'Lemonade',
        forSale: ['Soda', 'Lemonade', 'Iced Tea', 'Coffee']
      }, action: AnyAction) => {
      switch (action.type) {
        case SET_FAVORITE_DRINKS:
          return { ...state, favorite: action.payload };
        case SET_DRINKS_FOR_SALE:
          return { ...state, forSale: action.payload };
        default:
          return state;
      }
    },
  }
  describe('createModule', function () {

    it('should create a Duck Module', function() {
      const result = createModule(chipsModule.name, chipsModule.reducer, chipsModule.actions, chipsModule.selectors);
      expect(result).to.have.property('reducer');
      expect(result).to.have.property('actions');
      expect(result).to.have.property('selectors');
    });

    it('should create a Duck Module with wrapped selectors', function() {
      const result = createModule(chipsModule.name, chipsModule.reducer, chipsModule.actions, chipsModule.selectors);

      expect(result.selectors.getFavorite).to.not.equal(chipsModule.selectors.getFavorite);
    });
  });

  describe('combineModuleReducers', function () {
    it('should create a root reducer', function() {
      const chips = createModule(chipsModule.name, chipsModule.reducer, chipsModule.actions, chipsModule.selectors);
      const drinks = createModule(drinksModule.name, drinksModule.reducer, drinksModule.actions, drinksModule.selectors);
      const reducer = combineModuleReducers([chips, drinks]);

      expect(reducer).to.be.a('function');
    });

    it('should create a root reducer that produces a scoped state', function() {
      const chips = createModule(chipsModule.name, chipsModule.reducer, chipsModule.actions, chipsModule.selectors);
      const drinks = createModule(drinksModule.name, drinksModule.reducer, drinksModule.actions, drinksModule.selectors);
      const reducer = combineModuleReducers([chips, drinks]);
      const state = reducer(undefined, { type: '__INIT__' });

      expect(state).to.have.property('chips');
      expect(state).to.have.property('drinks');
    });

    it('should create a root reducer updates state properly', function() {
      const chips = createModule(chipsModule.name, chipsModule.reducer, chipsModule.actions, chipsModule.selectors);
      const drinks = createModule(drinksModule.name, drinksModule.reducer, drinksModule.actions, drinksModule.selectors);
      const reducer = combineModuleReducers([chips, drinks]);
      const state = reducer(undefined, { type: '__INIT__' });

      const updatedState = reducer(state, chips.actions.setFavorite('BBQ'));

      expect(updatedState.chips.favorite).to.equal('BBQ');
    });

    it('should create scoped selectors that work off root state', function() {
      const chips = createModule(chipsModule.name, chipsModule.reducer, chipsModule.actions, chipsModule.selectors);
      const drinks = createModule(drinksModule.name, drinksModule.reducer, drinksModule.actions, drinksModule.selectors);
      const reducer = combineModuleReducers([chips, drinks]);
      const state = reducer(undefined, { type: '__INIT__' });

      const favDrink = drinks.selectors.getFavorite(state);
      expect(favDrink).to.equal('Lemonade');
    });

    it('should create scoped selectors that return scoped updated values', function() {
      const chips = createModule(chipsModule.name, chipsModule.reducer, chipsModule.actions, chipsModule.selectors);
      const drinks = createModule(drinksModule.name, drinksModule.reducer, drinksModule.actions, drinksModule.selectors);
      const reducer = combineModuleReducers([chips, drinks]);
      const state = reducer(undefined, { type: '__INIT__' });
      const updatedState = reducer(state, chips.actions.setFavorite('BBQ'));

      const favChips = chips.selectors.getFavorite(updatedState);
      expect(favChips).to.equal('BBQ');
    });
  });
});
