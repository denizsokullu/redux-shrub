import { ReduxLeaf, ReduxBranch, ReduxPolyBranch, ReduxRoot} from './source';

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

export { ReduxLeaf,
         ReduxBranch,
         ReduxPolyBranch,
         ReduxRoot,
         createReduxLeaf,
         createReduxBranch,
         createReduxPolyBranch,
         createReduxRoot
        }