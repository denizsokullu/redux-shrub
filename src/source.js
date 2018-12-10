
import pick from 'lodash/pick'
import mapKeys from 'lodash/mapKeys'
import mapValues from 'lodash/mapValues'
import snakeCase from 'lodash/snakeCase'
import camelCase from 'lodash/camelCase'
import keys from 'lodash/keys'
import startsWith from 'lodash/startsWith'
import merge from 'lodash/merge'

import { Map } from 'immutable'

const flattenLeavesOnly = (obj) => Object.assign({}, ...function _flatten(o) { return [].concat(...Object.keys(o).map(k => typeof o[k] === 'object' ? _flatten(o[k]) : ({[k]: o[k]})))}(obj))


class ReduxShrub {
  constructor({ slug,
                includeSelfSelector = true,
                includeSlugInChildSelectors = false,
                includeSlugInChildReducers = false, }){
    this.slug = slug
    this.includeSelfSelector = includeSelfSelector
    this.includeSlugInChildSelectors = includeSlugInChildSelectors
    this.includeSlugInChildReducers = includeSlugInChildReducers
    this.selfPrefix = '_'
  }

  _composeSelfReducers = () => {
    let reducers = pick(this, this._findReducerKeys())
    let slugAddedReducers = mapKeys(reducers, (v, k) => this._addSnakeSlug(this.slug, k))
    return slugAddedReducers
  }

  _addSnakeSlug = (slug, key) => snakeCase(slug + '_' + key).toUpperCase()

  _addCamelSlug = (slug, key) => camelCase(slug + '_' + key)

  _findReducerKeys = () => keys(this).filter(key => !startsWith(key, this.selfPrefix) && typeof this[key] === 'function')

  _isBranch = () => this.type === 'branch'
  _isLeaf = () => this.type === 'leaf'
  _isPolyBranh = () => this.type === 'polyBranch'
}

class ReduxLeaf extends ReduxShrub {
  constructor(props){
    super(props)
    this.type = 'leaf'
    this.initialState = props.initialState
  }

  _newState = () => this.initialState

  _composeSelectors = key => this.includeSelfSelector ? { [key]: (state, payload) => state } : {}

  _composeReducers = this._composeSelfReducers
}

class ReduxBranch extends ReduxShrub {
  constructor(props){
    super(props)
    this.type = 'branch'
    this.children = props.children
  }

  _newState = (payload) => {
    return  Map(mapValues(this.children, (child, key) => {
      return child._newState(payload)
    }))
  }

  _composeReducers = () => {
    let childReducers = mapValues(this.children, child => child._composeReducers())
    let propagatedReducers = mapValues(childReducers, (reducers, key) => mapValues(reducers, reducer => {
        return state => payload => {
          let innerState = state.get(key)
          let newInnerState = reducer(innerState)(payload)
          return state.set(key, newInnerState)
      }
    }))
    propagatedReducers = flattenLeavesOnly(propagatedReducers)
    if(this.includeSlugInChildReducers){
      propagatedReducers = mapKeys(propagatedReducers, (v,k) => this._addSnakeSlug(this.slug, k))
    }
    return propagatedReducers
  }

  _composeSelectors = key => {
    let selfSelector = {}
    if(this.includeSelfSelector){
      selfSelector = ({ [key]: (state, payload) => state })
    }
    let allChildSelectors = mapValues(this.children,
      (child, childKey) => {
        let selectors = child._composeSelectors(childKey)
        selectors = mapValues(selectors, selector => {
          return (state, payload) => {
            return selector(state.get(childKey), payload)
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
  _createMainReducer = () => {
    let defaultState = this._newState()
    return (state = defaultState,  action) => {
      let reducers = this._composeReducers()
      let currentReducer = reducers[action.type]
      if(currentReducer && typeof currentReducer === 'function') return currentReducer(state)(action.payload)
      else return state
    }
  }

  _composeActions = () => mapValues(this._composeReducers(), (f, type) => (payload) => ({ payload, type }))

  _composeSelectors = () => {
    let allChildSelectors = mapValues(this.children,
    (child, childKey) => {
        let selectors = child._composeSelectors(childKey)
        selectors = mapValues(selectors, selector => {
          return (state, payload) => {
            return selector(state.get(childKey), payload)
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
}

class ReduxPolyBranch extends ReduxBranch {
  constructor(props){
    super(props)
    this.type = 'polyBranch'
    this.accessor = props.accessor
    this.childReducer = props.childReducer
    this.childSlug = this.childReducer.slug
  }

  // declaring built in polyBranch actions

  add = state => payload => {
    let newElement = this.childReducer._newState(payload)
    let newId = payload[this.accessor]
    let newState =  state.set(newId, newElement)
    return newState
  }

  remove = state => payload => {
    let id = payload[this.accessor]
    let newState = state.delete(id)
    return newState
  }

  _newState = () => Map()

  _composeReducers = () => {
    let childReducers = this.childReducer._composeReducers()
    let propagatedReducers = mapValues(childReducers, (reducer, key) => {
        return state => payload => {
          let innerState = state.get(payload[this.accessor])
          let newInnerState = reducer(innerState)(payload)
          return state.set(payload[this.accessor], newInnerState)
      }
    })
    if(this.includeSlugInChildReducers){
      propagatedReducers = mapKeys(propagatedReducers, (v,k) => this._addSnakeSlug(this.slug, k))
    }
    return merge(this._composeSelfReducers(), propagatedReducers)
  }

  _composeSelectors = key => {
    let selfSelector = {}
    if(this.includeSelfSelector){
      selfSelector = ({ [key]: (state, payload) => state })
    }
    let childSelectors = this.childReducer._composeSelectors(this.childSlug)
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

export { ReduxBranch, ReduxPolyBranch, ReduxLeaf, ReduxRoot }