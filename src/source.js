
import pick from 'lodash/pick'
import mapKeys from 'lodash/mapKeys'
import mapValues from 'lodash/mapValues'
import snakeCase from 'lodash/snakeCase'
import camelCase from 'lodash/camelCase'
import keys from 'lodash/keys'
import startsWith from 'lodash/startsWith'
import merge from 'lodash/merge'

// ideas: make it native objects

const flattenLeavesOnly = (obj) => Object.assign({}, ...function _flatten(o) { return [].concat(...Object.keys(o).map(k => typeof o[k] === 'object' ? _flatten(o[k]) : ({[k]: o[k]})))}(obj))


// class ReduxShrub {
//   constructor({ slug,
//                 includeSelfSelector = true,
//                 includeSlugInChildSelectors = false,
//                 includeSlugInChildReducers = false, }){
//     this.slug = slug
//     this.includeSelfSelector = includeSelfSelector
//     this.includeSlugInChildSelectors = includeSlugInChildSelectors
//     this.includeSlugInChildReducers = includeSlugInChildReducers
//     this.selfPrefix = '_'
//   }

//   _composeSelfReducers = () => {
//     let reducers = pick(this, this._findReducerKeys())
//     let slugAddedReducers = mapKeys(reducers, (v, k) => this._addSnakeSlug(this.slug, k))
//     return slugAddedReducers
//   }

//   _addSnakeSlug = (slug, key) => snakeCase(slug + '_' + key).toUpperCase()

//   _addCamelSlug = (slug, key) => camelCase(slug + '_' + key)

//   _findReducerKeys = () => keys(this).filter(key => !startsWith(key, this.selfPrefix) && typeof this[key] === 'function')

//   _isBranch = () => this.type === 'branch'
//   _isLeaf = () => this.type === 'leaf'
//   _isPolyBranch = () => this.type === 'polyBranch'
// }

// class ReduxLeaf extends ReduxShrub {
//   constructor(props){
//     super(props)
//     this.type = 'leaf'
//     this.initialState = props.initialState
//   }

//   _newState = () => this.initialState

//   composeSelectors = key => this.includeSelfSelector ? { [key]: (state, payload) => state } : {}

//   composeReducers = this._composeSelfReducers

//   _toJSON = (state, isRoot = false) => {
//     return isRoot ? JSON.stringify(state) : state
//   }

//   _fromJSON = (jsonState, isRoot = false) => {
//     return isRoot ? JSON.parse(jsonState) : jsonState
//   }

//   fromJSON = (state, payload) => {
//     return this._fromJSON(payload.json, true)
//   }
// }

// class ReduxBranch extends ReduxShrub {
//   constructor(props){
//     super(props)
//     this.type = 'branch'
//     this.children = props.children
//   }

//   _newState = (payload) => {
//     return Map(mapValues(this.children, (child, key) => {
//       return child._newState(payload)
//     }))
//   }

//   _toJSON = (state, isRoot = false) => {
//     const collectedState = mapValues(this.children, (child, key) => {
//       return child._toJSON(state.get(key))
//     });
//     return isRoot ? JSON.stringify(collectedState) : collectedState;
//   }

//   _fromJSON = (jsonState, isRoot = false) => {
//     const extractedState = isRoot ? JSON.parse(jsonState) : jsonState
//     return Map(mapValues(this.children, (child, key) => {
//       return child._fromJSON(extractedState[key])
//     }))
//   }

//   fromJSON = (state, payload) => {
//     return this._fromJSON(payload.json, true)
//   }

//   composeReducers = () => {
//     let childReducers = mapValues(this.children, child => child.composeReducers())
//     let propagatedReducers = mapValues(childReducers, (reducers, key) => mapValues(reducers, reducer => {
//         return state => payload => {
//           let innerState = state.get(key)
//           let newInnerState = reducer(innerState)(payload)
//           return state.set(key, newInnerState)
//       }
//     }))
//     propagatedReducers = flattenLeavesOnly(propagatedReducers)
//     if(this.includeSlugInChildReducers){
//       propagatedReducers = mapKeys(propagatedReducers, (v,k) => this._addSnakeSlug(this.slug, k))
//     }
//     return propagatedReducers
//   }

//   composeSelectors = key => {
//     let selfSelector = {}
//     if(this.includeSelfSelector){
//       selfSelector = ({ [key]: (state, payload) => state })
//     }
//     let allChildSelectors = mapValues(this.children,
//       (child, childKey) => {
//         let selectors = child.composeSelectors(childKey)
//         selectors = mapValues(selectors, selector => {
//           return (state, payload) => {
//             return selector(state.get(childKey), payload)
//           }
//         })
//         return selectors
//       }
//     )
//     allChildSelectors = flattenLeavesOnly(allChildSelectors)
//     if(this.includeSlugInChildSelectors){
//       allChildSelectors = mapKeys(allChildSelectors, (v,k) => this._addCamelSlug(this.slug, k))
//     }
//     return merge(selfSelector, allChildSelectors)
//   }
// }

// class ReduxRoot extends ReduxBranch {

//   constructor(props) {
//     super(props);
//     this.reducer = this._createMainReducer();
//     this.selectors =  this.composeSelectors();
//     this.actions = this._composeActions();
//   }

//   _createMainReducer = () => {
//     let defaultState = this._newState()
//     return (state = defaultState,  action) => {
//       let reducers = this.composeReducers()
//       let currentReducer = reducers[action.type]
//       if(currentReducer && typeof currentReducer === 'function') return currentReducer(state)(action.payload)
//       else return state
//     }
//   }

//   _composeActions = () => mapValues(this.composeReducers(), (f, type) => (payload) => ({ payload, type }))

//   composeSelectors = () => {
//     let allChildSelectors = mapValues(this.children,
//     (child, childKey) => {
//         let selectors = child.composeSelectors(childKey)
//         selectors = mapValues(selectors, selector => {
//           return (state, payload) => {
//             return selector(state.get(childKey), payload)
//           }
//         })
//         return selectors
//       }
//     )
//     allChildSelectors = flattenLeavesOnly(allChildSelectors)
//     if(this.includeSlugInChildSelectors){
//       allChildSelectors = mapKeys(allChildSelectors, (v,k) => this._addCamelSlug(this.slug, k))
//     }
//     return allChildSelectors
//   }

//   toJSON = (state) => {
//     return this._toJSON(state, true)
//   }
// }

// class ReduxPolyBranch extends ReduxBranch {
//   constructor(props){
//     super(props)
//     this.type = 'polyBranch'
//     this.accessor = props.accessor
//     this.childReducer = props.childReducer
//     this.childSlug = this.childReducer.slug
//   }

//   // declaring built in polyBranch actions

//   add = state => payload => {
//     let newElement = this.childReducer._newState(payload)
//     let newId = payload[this.accessor]
//     let newState =  state.set(newId, newElement)
//     return newState
//   }

//   remove = state => payload => {
//     let id = payload[this.accessor]
//     let newState = state.delete(id)
//     return newState
//   }

//   _newState = () => Map()

//   composeReducers = () => {
//     let childReducers = this.childReducer.composeReducers()
//     let propagatedReducers = mapValues(childReducers, (reducer, key) => {
//         return state => payload => {
//           let innerState = state.get(payload[this.accessor])
//           let newInnerState = reducer(innerState)(payload)
//           return state.set(payload[this.accessor], newInnerState)
//       }
//     })
//     if(this.includeSlugInChildReducers){
//       propagatedReducers = mapKeys(propagatedReducers, (v,k) => this._addSnakeSlug(this.slug, k))
//     }
//     return merge(this._composeSelfReducers(), propagatedReducers)
//   }

//   composeSelectors = key => {
//     let selfSelector = {}
//     if(this.includeSelfSelector){
//       selfSelector = ({ [key]: (state, payload) => state })
//     }
//     let childSelectors = this.childReducer.composeSelectors(this.childSlug)
//     childSelectors = mapValues(childSelectors,
//       (selector, childKey) => {
//         return (state, payload) => {
//           return selector(state.get(payload[this.accessor]), payload)
//         }
//       }
//     )
//     childSelectors = flattenLeavesOnly(childSelectors)
//     if(this.includeSlugInChildSelectors){
//       childSelectors = mapKeys(childSelectors, (v,k) => this._addCamelSlug(this.slug, k))
//     }
//     return merge(selfSelector, childSelectors)
//   }

// }

// class ReduxShrub {
//   constructor({ slug,
//                 includeSelfSelector = true,
//                 includeSlugInChildSelectors = false,
//                 includeSlugInChildReducers = false,
//                 includeJSONAction = false,
//                }){
//     this.slug = slug
//     this.includeSelfSelector = includeSelfSelector
//     this.includeSlugInChildSelectors = includeSlugInChildSelectors
//     this.includeSlugInChildReducers = includeSlugInChildReducers
//     this.includeJSONAction = includeJSONAction
//     this.selfPrefix = '_'
//   }

//   _composeSelfReducers = () => {
//     let reducers = pick(this, this._findReducerKeys())
//     let slugAddedReducers = mapKeys(reducers, (v, k) => this._addSnakeSlug(this.slug, k))
//     return slugAddedReducers
//   }

//   _addSnakeSlug = (slug, key) => snakeCase(slug + '_' + key).toUpperCase()

//   _addCamelSlug = (slug, key) => camelCase(slug + '_' + key)

//   _findReducerKeys = () => keys(this)
//     .filter(key => !startsWith(key, this.selfPrefix) && typeof this[key] === 'function').filter(this._isNotJSONAction.bind(this))

//   _isNotJSONAction = key => {
//     if (this.includeJSONAction) return true;
//     return key !== 'fromJSON'
//   }
//   _isBranch = () => this.type === 'branch'
//   _isLeaf = () => this.type === 'leaf'
//   _isPolyBranch = () => this.type === 'polyBranch'
// }

// class ReduxLeaf extends ReduxShrub {
//   constructor(props){
//     super(props)
//     this.type = 'leaf'
//     this.initialState = props.initialState
//   }

//   _newState = () => this.initialState

//   composeSelectors = key => this.includeSelfSelector ? { [key]: (state, payload) => state } : {}

//   composeReducers = this._composeSelfReducers

//   _toJSON = (state, isRoot = false) => {
//     return isRoot ? JSON.stringify(state) : state
//   }

//   _fromJSON = (jsonState, isRoot = false) => {
//     return isRoot ? JSON.parse(jsonState) : jsonState
//   }

//   fromJSON = (state, payload) => {
//     return this._fromJSON(payload.json, true)
//   }
// }

// class ReduxBranch extends ReduxShrub {
//   constructor(props){
//     super(props)
//     this.type = 'branch'
//     this.children = props.children
//   }

//   _newState = (payload) => {
//     return mapValues(this.children, (child, key) => {
//       return child._newState(payload)
//     })
//   }

//   _toJSON = (state, isRoot = false) => {
//     const collectedState = mapValues(this.children, (child, key) => {
//       return child._toJSON(state.get(key))
//     });
//     return isRoot ? JSON.stringify(collectedState) : collectedState;
//   }

//   _fromJSON = (jsonState, isRoot = false) => {
//     const extractedState = isRoot ? JSON.parse(jsonState) : jsonState
//     return mapValues(this.children, (child, key) => {
//       return child._fromJSON(extractedState[key])
//     })
//   }

//   fromJSON = (state, payload) => {
//     return this._fromJSON(payload.json, true)
//   }

//   composeReducers = () => {
//     let childReducers = mapValues(this.children, child => child.composeReducers())
//     let propagatedReducers = mapValues(childReducers, (reducers, key) => mapValues(reducers, reducer => {
//         return state => payload => {
//           let innerState = state[key]
//           let newInnerState = reducer(innerState)(payload)
//           return { ...state, [key]: newInnerState}
//       }
//     }))
//     propagatedReducers = flattenLeavesOnly(propagatedReducers)
//     if(this.includeSlugInChildReducers){
//       propagatedReducers = mapKeys(propagatedReducers, (v,k) => this._addSnakeSlug(this.slug, k))
//     }
//     return propagatedReducers
//   }

//   composeSelectors = key => {
//     let selfSelector = {}
//     if(this.includeSelfSelector){
//       selfSelector = ({ [key]: (state, payload) => state })
//     }
//     let allChildSelectors = mapValues(this.children,
//       (child, childKey) => {
//         let selectors = child.composeSelectors(childKey)
//         selectors = mapValues(selectors, selector => {
//           return (state, payload) => {
//             return selector(state[childKey], payload)
//           }
//         })
//         return selectors
//       }
//     )
//     allChildSelectors = flattenLeavesOnly(allChildSelectors)
//     if(this.includeSlugInChildSelectors){
//       allChildSelectors = mapKeys(allChildSelectors, (v,k) => this._addCamelSlug(this.slug, k))
//     }
//     return merge(selfSelector, allChildSelectors)
//   }
// }

// class ReduxRoot extends ReduxBranch {

//   constructor(props) {
//     super(props);
//     this.reducer = this._createMainReducer();
//     // this.selectors =  this.composeSelectors();
//     // this.actions = this._composeActions();
//   }

//   _createMainReducer = () => {
//     let defaultState = this._newState()
//     return (state = defaultState,  action) => {
//       let reducers = this.composeReducers()
//       let currentReducer = reducers[action.type]
//       if(currentReducer && typeof currentReducer === 'function') return currentReducer(state)(action.payload)
//       else return state
//     }
//   }

//   _composeActions = () => mapValues(this.composeReducers(), (f, type) => (payload) => ({ payload, type }))

//   composeSelectors = () => {
//     let allChildSelectors = mapValues(this.children,
//     (child, childKey) => {
//         let selectors = child.composeSelectors(childKey)
//         selectors = mapValues(selectors, selector => {
//           return (state, payload) => {
//             return selector(state[childKey], payload)
//           }
//         })
//         return selectors
//       }
//     )
//     allChildSelectors = flattenLeavesOnly(allChildSelectors)
//     if(this.includeSlugInChildSelectors){
//       allChildSelectors = mapKeys(allChildSelectors, (v,k) => this._addCamelSlug(this.slug, k))
//     }
//     return allChildSelectors
//   }

//   toJSON = (state) => {
//     return this._toJSON(state, true)
//   }
// }

// class ReduxPolyBranch extends ReduxBranch {
//   constructor(props){
//     super(props)
//     this.type = 'polyBranch'
//     this.accessor = props.accessor
//     this.childReducer = props.childReducer
//     this.childSlug = this.childReducer.slug
//   }

//   // declaring built in polyBranch actions

//   add = state => payload => {
//     let newElement = this.childReducer._newState(payload)
//     let newId = payload[this.accessor]
//     return { ...state, [newId]: newElement }
//   }

//   remove = state => payload => {
//     let id = payload[this.accessor]
//     delete state[id]
//     return { ...state };
//   }

//   _newState = () => {}

//   composeReducers = () => {
//     let childReducers = this.childReducer.composeReducers()
//     let propagatedReducers = mapValues(childReducers, (reducer, key) => {
//         return state => payload => {
//           let innerState = state[payload[this.accessor]]
//           let newInnerState = reducer(innerState)(payload)
//           return { ...state, [payload[this.accessor]]: newInnerState }
//       }
//     })
//     if(this.includeSlugInChildReducers){
//       propagatedReducers = mapKeys(propagatedReducers, (v,k) => this._addSnakeSlug(this.slug, k))
//     }
//     return merge(this._composeSelfReducers(), propagatedReducers)
//   }

//   composeSelectors = key => {
//     let selfSelector = {}
//     if(this.includeSelfSelector){
//       selfSelector = ({ [key]: (state, payload) => state })
//     }
//     let childSelectors = this.childReducer.composeSelectors(this.childSlug)
//     childSelectors = mapValues(childSelectors,
//       (selector, childKey) => {
//         return (state, payload) => {
//           return selector(state.get(payload[this.accessor]), payload)
//         }
//       }
//     )
//     childSelectors = flattenLeavesOnly(childSelectors)
//     if(this.includeSlugInChildSelectors){
//       childSelectors = mapKeys(childSelectors, (v,k) => this._addCamelSlug(this.slug, k))
//     }
//     return merge(selfSelector, childSelectors)
//   }

// }


class RootReducer {

}

class ShrubProvider {
  constructor(root) {
    this.root = root;
    this.reducer = this.root.reducer()
    this.selectors = this.root.selectors()
    this.actions = this.root.actions()
  }
}

const compose = tree => {
  const children = {};
  tree.map(value => {
    children[value.slug] = value;
  })
  const root = new ReduxRoot({ slug: 'root', reducerClass: RootReducer, children })
  return new ShrubProvider(root);
}

const leaf = (key, reducerClass, options) => {
  return new ReduxLeaf({
    slug: key,
    reducerClass: reducerClass
  })
}

const branch = (key, reducerClass, children = []) => {
  const childrenObj = {};
  children.map(child => {
    childrenObj[child.slug] = child;
  })

  return new ReduxBranch({
    slug: key,
    children: childrenObj,
    reducerClass: reducerClass
  })
}

const polyBranch = (key, reducerClass, child) => {
  return new ReduxPolyBranch({
    slug: key,
    reducerClass: reducerClass,
    childReducer: child
  })
}


class ReduxShrub {
  constructor({ slug,
                includeSelfSelector = true,
                includeSlugInChildSelectors = false,
                includeSlugInChildReducers = false,
                includeJSONAction = false,
                ignorePrefix = '_'
               }){
    this.slug = slug
    this.includeSelfSelector = includeSelfSelector
    this.includeSlugInChildSelectors = includeSlugInChildSelectors
    this.includeSlugInChildReducers = includeSlugInChildReducers
    this.includeJSONAction = includeJSONAction
    this.ignorePrefix = ignorePrefix
  }

  _composeSelfReducers = () => {
    let reducers = pick(this.reducerInstance, this.findReducerKeys())
    let slugAddedReducers = mapKeys(reducers, (v, k) => this._addSnakeSlug(this.slug, k))
    return slugAddedReducers
  }

  _addSnakeSlug = (slug, key) => snakeCase(slug + '_' + key).toUpperCase()

  _addCamelSlug = (slug, key) => camelCase(slug + '_' + key)

  findReducerKeys = () => {
    if (!this.reducerInstance) return [];

    // only keys that are a function
    // keys excluding newState
    // if inludeJSONAction is not true, exclude fromJSON

    return keys(this.reducerInstance)
      .filter(key => typeof this.reducerInstance[key] === 'function')
      .filter(key => key !== 'newState')
      .filter(key => !key.startsWith(this.ignorePrefix))
      .filter(this._isNotJSONAction.bind(this))
  }

  _isNotJSONAction = key => {
    if (this.includeJSONAction) return true;
    return key !== 'fromJSON'
  }

  _isBranch = () => this.type === 'branch'
  _isLeaf = () => this.type === 'leaf'
  _isPolyBranch = () => this.type === 'polyBranch'
}

class ReduxLeaf extends ReduxShrub {
  constructor(props){
    super(props)
    this.type = 'leaf'
    this.reducerInstance = new props.reducerClass()
  }

  _newState = () => this.reducerInstance.newState()

  composeSelectors = key => this.includeSelfSelector ? { [key]: (state, payload) => state } : {}

  composeReducers = this._composeSelfReducers

  _toJSON = (state, isRoot = false) => {
    return isRoot ? JSON.stringify(state) : state
  }

  _fromJSON = (jsonState, isRoot = false) => {
    return isRoot ? JSON.parse(jsonState) : jsonState
  }

  fromJSON = (state, payload) => {
    return this._fromJSON(payload.json, true)
  }
}

class ReduxBranch extends ReduxShrub {
  constructor(props){
    super(props)
    this.type = 'branch'
    this.children = props.children || {}
    this.reducerInstance = new props.reducerClass()
  }

  _newState = (payload) => {
    const childStates = mapValues(this.children, (child, key) => {
      return child._newState(payload)
    })
    if (this.reducerInstance.newState) {
      return this.reducerInstance.newState(childStates)
    }
    return childStates
  }

  _toJSON = (state, isRoot = false) => {
    const collectedState = mapValues(this.children, (child, key) => {
      return child._toJSON(state.get(key))
    });
    return isRoot ? JSON.stringify(collectedState) : collectedState;
  }

  _fromJSON = (jsonState, isRoot = false) => {
    const extractedState = isRoot ? JSON.parse(jsonState) : jsonState
    return mapValues(this.children, (child, key) => {
      return child._fromJSON(extractedState[key])
    })
  }

  fromJSON = (state, payload) => {
    return this._fromJSON(payload.json, true)
  }

  composeReducers = () => {
    let childReducers = mapValues(this.children, child => child.composeReducers())
    let propagatedReducers = mapValues(childReducers, (reducers, key) => mapValues(reducers, reducer => {
        return state => payload => {
          let innerState = state[key]
          let newInnerState = reducer(innerState)(payload)
          return { ...state, [key]: newInnerState}
      }
    }))
    propagatedReducers = flattenLeavesOnly(propagatedReducers)
    if(this.includeSlugInChildReducers){
      propagatedReducers = mapKeys(propagatedReducers, (v,k) => this._addSnakeSlug(this.slug, k))
    }
    return propagatedReducers
  }

  reducer = () => {
    const defaultState = this._newState()
    const reducers = this.composeReducers()
    return (state = defaultState, action) => {
      let currentReducer = reducers[action.type]
      if(currentReducer && typeof currentReducer === 'function') return currentReducer(state)(action.payload)
      else return state
    }
  }

  composeSelectors = key => {
    let selfSelector = {}
    if(this.includeSelfSelector){
      selfSelector = ({ [key]: (state, payload) => state })
    }
    let allChildSelectors = mapValues(this.children,
      (child, childKey) => {
        let selectors = child.composeSelectors(childKey)
        selectors = mapValues(selectors, selector => {
          return (state, payload) => {
            return selector(state[childKey], payload)
          }
        })
        return selectors
      }
    )
    allChildSelectors = flattenLeavesOnly(allChildSelectors)
    if(this.includeSlugInChildSelectors){
      allChildSelectors = mapKeys(allChildSelectors, (v,k) => this._addCamelSlug(this.slug, k))
    }
    return merge(selfSelector, allChildSelectors)
  }
}

class ReduxRoot extends ReduxBranch {

  constructor(props) {
    super(props);
  }

  actions = () => mapValues(this.composeReducers(), (f, type) => (payload) => ({ payload, type }))

  selectors = () => {
    let allChildSelectors = mapValues(this.children,
    (child, childKey) => {
        let selectors = child.composeSelectors(childKey)
        selectors = mapValues(selectors, selector => {
          return (state, payload) => {
            return selector(state[childKey], payload)
          }
        })
        return selectors
      }
    )
    allChildSelectors = flattenLeavesOnly(allChildSelectors)
    if(this.includeSlugInChildSelectors){
      allChildSelectors = mapKeys(allChildSelectors, (v,k) => this._addCamelSlug(this.slug, k))
    }
    return allChildSelectors
  }

  toJSON = (state) => {
    return this._toJSON(state, true)
  }
}

class ReduxPolyBranch extends ReduxBranch {
  constructor(props){
    super(props)
    this.type = 'polyBranch'
    this.childReducer = props.childReducer
    this.childSlug = this.childReducer.slug
    this.reducerInstance = new props.reducerClass()
    this.accessor = this.reducerInstance.accessor
    this.extendReducer();
  }

  extendReducer = () => {
    if (!this.reducerInstance.add) {
      this.reducerInstance.add = state => payload => {
        let newElement = this.childReducer._newState(payload)
        let newId = payload[this.accessor]
        return { ...state, [newId]: newElement }
      }
    }
    if (!this.reducerInstance.remove) {
      this.reducerInstance.remove = state => payload => {
        let id = payload[this.accessor]
        delete state[id]
        return { ...state };
      }
    }
  }

  // declaring built in polyBranch actions

  _newState = () => {}

  composeReducers = () => {
    let childReducers = this.childReducer.composeReducers()
    let propagatedReducers = mapValues(childReducers, (reducer, key) => {
        return state => payload => {
          let innerState = state[payload[this.accessor]]
          let newInnerState = reducer(innerState)(payload)
          return { ...state, [payload[this.accessor]]: newInnerState }
      }
    })
    if(this.includeSlugInChildReducers){
      propagatedReducers = mapKeys(propagatedReducers, (v,k) => this._addSnakeSlug(this.slug, k))
    }
    return merge(this._composeSelfReducers(), propagatedReducers)
  }

  composeSelectors = key => {
    let selfSelector = {}
    if(this.includeSelfSelector){
      selfSelector = ({ [key]: (state, payload) => state })
    }
    let childSelectors = this.childReducer.composeSelectors(this.childSlug)
    childSelectors = mapValues(childSelectors,
      (selector, childKey) => {
        return (state, payload) => {
          return selector(state.get(payload[this.accessor]), payload)
        }
      }
    )
    childSelectors = flattenLeavesOnly(childSelectors)
    if(this.includeSlugInChildSelectors){
      childSelectors = mapKeys(childSelectors, (v,k) => this._addCamelSlug(this.slug, k))
    }
    return merge(selfSelector, childSelectors)
  }

}

export { ReduxBranch, ReduxPolyBranch, ReduxLeaf, ReduxRoot, compose, leaf, branch }
