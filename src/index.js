import { ReduxLeaf,
         ReduxBranch,
         ReduxPolyBranch,
         ReduxRoot,
         compose,
         branch,
         leaf
       } from './source';

const createReduxLeaf = (slug, initialState, options = {}) => new ReduxLeaf({
  slug,
  initialState,
  ...options
})

const createReduxBranch = (slug, children = {}, options = {}) => new ReduxBranch({
    slug,
    children,
    ...options
  })


const createReduxPolyBranch = (slug, childReducer, children = {}, options = {}) =>
  new ReduxPolyBranch({
    slug,
    childReducer,
    children,
    ...options
  })

const createReduxRoot = (slug, children = {}, options = {}) =>
  new ReduxRoot({
    slug,
    children,
    ...options
  })

// TODO
class StringLeaf extends ReduxLeaf {
  _newState = (initialState) => typeof initialState === 'string' ? initialState : ''
}

class ArrayLeaf extends ReduxLeaf {

}

class MapLeaf extends ReduxLeaf {

}

class IntegerLeaf extends ReduxLeaf {
  _newState = (initialState) => typeof initialState === 'number' ? initialState : 0
}

class SetLeaf extends ReduxLeaf {

}

class OrderedSetLeaf extends ReduxLeaf {

}

export { ReduxLeaf,
         ReduxBranch,
         ReduxPolyBranch,
         ReduxRoot,
         createReduxLeaf,
         createReduxBranch,
         createReduxPolyBranch,
         createReduxRoot,
         compose,
         branch,
         leaf
        }
