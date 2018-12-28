# redux-shrub
Branch - Leaf based Redux framework that creates the reducers, actions and selectors on the go.

The idea is based on incorporating a OOP approach to redux store design and action declaring.

I personally felt challenged with the lack of structure that can could be given with a redux framework and went ahead and created one. This framework provides a structure in which the user doesn't have to worry about creating 3 different functions. Reducers, actions and selectors are created as you declare new leaves in your
state tree.

This is still at it's early stages. Plans for the future:
- Adding null checks!
- Providing more options and modularity.

Example usage

```js
import { ReduxLeaf, createReduxRoot } from 'redux-shrub';
import { Set } from 'immutable';

class TodosReducer extends ReduxLeaf {
  // payload is an object passed in when creating
  // a new reducer
  _newState = (payload) => Set()
  // this method will become an action
  update = state => payload => state.add(payload)
}

const todos = new TodosReducer({
  slug: 'todos'
});

const store = createReduxRoot('root', { todos });

const mainReducer =  store._createMainReducer();
const actions = store._composeActions();
const selectors = store._composeSelectors();

// actions created
// TODOS_UPDATE

// selectors created
// todos(state) => todo store

```

Another example

```js
import { ReduxLeaf, ReduxBranch, createReduxRoot } from 'redux-shrub';
import { Set } from 'immutable';

class TodosReducer extends ReduxLeaf {
  // payload is an object passed in when creating
  // a new reducer
  _newState = (payload) => Set()
  // this method will become an action
  update = state => payload => state.add(payload)
}

const todos = new TodosReducer({
  slug: 'todos'
});

const todosAndStrings = new ReduxBranch({
  slug: 'todosAndStrings',
  children: {
    todos,
    strings: new ReduxLeaf({ slug: 'strings', initialState: 'asd' })
  }
})

const store = createReduxRoot('root', { todosAndStrings });

const mainReducer =  store._createMainReducer();
const actions = store._composeActions();
const selectors = store._composeSelectors();

// actions created
// TODOS_UPDATE

// selectors created
todos(state);
// Set()
strings(state);
// 'asd'

```

To install

```sh
npm i redux-shrub
```
