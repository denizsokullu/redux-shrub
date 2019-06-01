const ReduxShrub = require('../lib');
const util = require('util')
const _ = require('lodash');
const uuid = require('uuid/v1');

const { compose, branch, leaf } = ReduxShrub;

/*
Helpers
*/

const inspect = (obj) => {
  console.log(util.inspect(obj, {showHidden: false, depth: null}))
}

const createDeepBranch = (limit, children = null, depth = 0) => {
  if (depth === 0) {
    return createDeepBranch(limit, [leaf('leaf1', SimpleLeaf)], depth + 1)
  }
  else if (depth === limit) {
    return branch('mainBranch', SimpleBranch, children)
  }
  else {
    return createDeepBranch(limit, [branch(`branch${depth}`, SimpleBranch, children)], depth + 1)
  }
}

const countKeys = (object) => {
  let count = 0
  if (typeof object === 'object') {
    for (let key in object) {
      let value = object[key]
      count++
      if (typeof value === 'object') {
          count += countKeys(value)
      }
    }
 }
 return count;
}

const createDeepBranchWithSiblings = (limit, siblings, depth = 0) => {
  if (depth === 0) {
    return branch('mainBranch', SimpleBranch, createDeepBranchWithSiblings(limit, siblings, depth + 1))
  }
  else if (depth === limit) {
    return [leaf('leaf'+ uuid(), SimpleLeaf)]
  }
  else {
    const children = []
    for (let i = 0; i < siblings; i++) {
      children.push(branch(`branch${depth}-${i}`, SimpleBranch, createDeepBranchWithSiblings(limit, siblings, depth + 1)))
    }
    return children
  }
}

class SimpleBranch {
  update = (state) => (payload) => {
    return { ...state }
  }
}

class SimpleLeaf {
  newState () {
    return `value${parseInt(Math.random()*1000)}`
  }

  update = (state) => (payload) => {
    return this.newState()
  }
}

// Test 1

// relatively small tree update

const test1 = (repeats) => {
  const branch1 = branch('branch1', null, [
    leaf('leaf1', SimpleLeaf),
    leaf('leaf2', SimpleLeaf)
  ])
  const branch2 = branch('branch2', null, [ leaf('leaf3', SimpleLeaf) ]);
  const shrub = compose([ branch('mainBranch', null, [ branch1, branch2 ])])
  let state = shrub.reducer(undefined, 'init');
  console.log(`this test example has ${countKeys(state)} nodes`)
  const testStart = Date.now();
  for (let i = 0; i < repeats; i ++) {
    state = shrub.reducer(state, shrub.actions.LEAF_1_UPDATE())
  }
  const testEnd = Date.now();
  console.log(`test took: ${testEnd - testStart} milliseconds`);
}

// deep branch update
const test2 = (repeats, depth) => {

  const shrub = compose([ createDeepBranch(depth) ])
  let state = shrub.reducer(undefined, 'init');
  console.log(`this test example has ${countKeys(state)} nodes`)
  const testStart = Date.now();
  for (let i = 0; i < repeats; i ++) {
    state = shrub.reducer(state, shrub.actions.LEAF_1_UPDATE())
  }
  const testEnd = Date.now();
  console.log(`test took: ${testEnd - testStart} milliseconds`);
}

// wide deep branch update
const test3 = (repeats, depth, siblings) => {

  const shrub = compose([ createDeepBranchWithSiblings(depth, siblings) ])
  let state = shrub.reducer(undefined, 'init');
  console.log(`this test example has ${countKeys(state)} nodes`)
  const testStart = Date.now();
  const action = shrub.actions[_.keys(shrub.actions)[0]];
  for (let i = 0; i < repeats; i ++) {
    state = shrub.reducer(state, action())
  }
  const testEnd = Date.now();
  console.log(`test took: ${testEnd - testStart} milliseconds`);
}

console.log('Starting performance tests:')
console.log('Running 1000 actions on a simple shrub')
test1(1000);
// console.log('Running 1000 actions on a shrub with depth of 4')
// test2(1000, 4);
// console.log('Running 1000 actions on a shrub with depth of 12 and 2 siblings at each level')
// test3(1000, 12, 2);
// console.log('Running 1000 actions on a shrub with depth of 7 and 5 siblings at each level')
// test3(1, 7, 5);
// console.log('Running 1000 actions on a shrub with depth of 16 and 2 siblings at each level')
// test3(1, 16, 2);
// console.log('Running 1000 actions on a shrub with depth of 9 and 4 siblings at each level')
// test3(1, 9, 4);
