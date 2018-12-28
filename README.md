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

API Documentation:
```js
class ReduxLeaf
/*
    slug: string
    initialState: state of the leaf
    options: object

    The smallest building block of a redux tree.
    A leaf can contain any type of data as its state.
    The class can be extended to create reducers and
    declare a function _newState that will can be
    used to transform the initial payload to an initial
    state.

    If ReduxLeaf is not extended to create a new sub class,
    there isn't currently a way to declare reducers.
*/

ReduxLeaf._newState
/*
    payload => state
    (optional)
    Called once when a class instance is created.
    The value returned here is the initial state
    for that leaf.
*/
```

```js
class ReduxBranch
/*
    slug: string
    children: object with values ReduxLeaf, ReduxBranch
    options: object

    The glue of a redux tree.
    A branch can be sub classed to create reducers but it
    is usually created to combine leaves and other branches.

    It has settings to modify naming conventions for the
    selectors and reducers.
*/

ReduxBranch._newState
/*
    payload => state
    (optional)
    Called once when a class instance is created.
    The value returned here is the initial state
    for that branch. Not suggested since it can
    break
*/
```

```js
ReduxBranch,
ReduxPolyBranch,
ReduxRoot,
createReduxLeaf,
createReduxBranch,
createReduxPolyBranch,
createReduxRoot
```

To install

```sh
npm i redux-shrub
```
