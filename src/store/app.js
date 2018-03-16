// ------------------------------------
// Constants
// ------------------------------------
export const SET_MENUBAR_STATE = 'SET_MENUBAR_STATE'
export const SET_VIEWER_ENV = 'SET_VIEWER_ENV'

// ------------------------------------
// Actions
// ------------------------------------
export function setMenubarState (state) {
  return {
    type    : SET_MENUBAR_STATE,
    payload : state
  }
}

export function setViewerEnv (env) {
  return {
    type    : SET_VIEWER_ENV,
    payload : env
  }
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [SET_MENUBAR_STATE] : (state, action) => {

    const menubar = merge({},
      state.menubar,
      action.payload)

    return Object.assign({}, state, {
      menubar
    })
  },
  [SET_VIEWER_ENV] : (state, action) => {

    return Object.assign({}, state, {
      viewerEnv: action.payload
    })
  }
}

// ------------------------------------
// Initial App State
// ------------------------------------
const createInitialState = () => {

  const defaultAppState = {
    layoutType: 'left'
  }

  const defaultState = {
      menubar: {
        visible: true,
        links:{

        }
      },
      viewerEnv: {

      },
      response: null
  }

  const initialState = Object.assign({},
    defaultState, {storage: defaultAppState})

  return initialState
}

// ------------------------------------
// Reducer
// ------------------------------------

export default function reducer (
  state = createInitialState(), action) {

  const handler = ACTION_HANDLERS[action.type]

  return handler
    ? handler(state, action)
    : state
}
