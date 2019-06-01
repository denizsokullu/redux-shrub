# redux-shrub
![Redux Shrub Logo](./redux-shrub.png "Redux Shrub Logo")
Branch - Leaf based Redux framework that creates the reducers, actions and selectors on the go.

The idea is based on incorporating a OOP approach to redux store design and action declaring.

## Table of Contents

* [Concepts](#concepts)
* [Main Components](#main-components)
* [Installation](#installation)
* [Examples](#examples)

## Concepts

*How does this work with Redux*
It actually doesn't require Redux to work. It produces a reducer that can be used to manipulate the state that redux keeps track of. And if you call the reducer function with an initial state of `undefined` it give you the state! In addition to that, it creates the actions and selectors from the information passed in. So in the end, all you need to define are classes that interact with parts of the tree(leaves, branches) using their methods(each method becomes an action).

*How is a shrub different than a tree?*
Shrub is subset of trees as a data structure. The concept of a shrub is that the data is only on the leaves on of the tree. By keeping the data only on the leaves, it becomes really simple to trace bugs and reason about the structure of the data stored globally.

*Reasoning behind coming up with redux-shrub*
I personally felt challenged with the lack of structure that can could be given with a redux framework and went ahead and created one. This framework provides a structure in which the user doesn't have to worry about creating 3 different functions. Reducers, actions and selectors are created as you declare new leaves in your state tree. It has similar API to [redux-tree](https://www.npmjs.com/package/redux-tree) but does more than that.

## Main Components

There are 3 types of building blocks to a shrub.

### leaf

This is where you keep your data. These will be at the end of a path on the tree and will have actions to modify them.

### branch

This is how you organize your data, you create different branches to split your information/leaves.

### polyBranch

This is a bit more complex but is necessary in a lot cases. Let's say you have multiple entries for a data object in your redux store.
```js
{
  'article-1': {...some data}
  'article-2': {...same data here, maybe the values are different but same structure}
  'article-3': {...same data here, maybe the values are different but same structure}
  ...
}
```
In this case, you can't manually set your tree to have a certain number of branches. And if you want to have actions for the data inside of these keys, you don't want to have duplicate actions. To solve this, you can define a way to produce keys and pass that in to a `polyBranch()` with whatever other branches / leaves you want in it and it will handle the rest. A bit magical but trust me it works :)

##

## Installation

```sh
npm i redux-shrub
```

## Examples

```js
import { compose, leaf } from 'redux-shrub';

class NameReducer {
  // this is what is called to
  // generate your initial state
  newState (){
    return 'initial name'
  }
  // this method will become an action
  update = state => payload => payload.newName
}

const todos = leaf('name', NameReducer);

const shrub = compose([ todos ]);

// Fake what redux does to generate the initial state
const reducer =  shrub.reducer(undefined, '@@init');
const actions = shrub.actions;
const selectors = shrub.selectors;

console.log(reducer, actions, selectors)
// { name: 'initial name' } { NAME_UPDATE: [Function] } { name: [Function] }
```

Another example

```js
import { compose, leaf, branch } from 'redux-shrub';

class NameReducer {
  // this is what is called to
  // generate your initial state
  newState (){
    return 'initial name'
  }
  // this method will become an action
  update = state => payload => payload.newName
}

class DataReducer {

}

const todos = leaf('name', NameReducer);
const data = branch('data', DataReducer, [ todos ]);

const shrub = compose([ data ]);

// Fake what redux does to generate the initial state
const reducer =  shrub.reducer(undefined, '@@init');
const actions = shrub.actions;
const selectors = shrub.selectors;

console.log(reducer, actions, selectors)
// { data: { name: 'initial name' } } { NAME_UPDATE: [Function] } { name: [Function], data: [Function] }
```
