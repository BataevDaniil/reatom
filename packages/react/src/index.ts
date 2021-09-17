import {
  Action,
  Atom,
  AtomState,
  defaultStore,
  getState,
  isActionCreator,
  Store,
} from '@reatom/core/'
import React from 'react'
import { useSubscription } from 'use-subscription'

export const reatomContext = React.createContext(defaultStore)

let batchedUpdates = (f: () => any) => f()
export const setBatchedUpdates = (f: (callback: () => any) => void) => {
  batchedUpdates = f
}

function bindActionCreator<Args extends any[]>(
  store: Store,
  actionCreator: (...args: Args) => Action | Action[] | void,
) {
  return (...args: Args) => {
    const action = actionCreator(...args)

    if (action) {
      batchedUpdates(() => {
        store.dispatch(action)
      })
    }
  }
}

export function useAction<Args extends any[] = []>(
  actionCreator: (...args: Args) => Action | Action[] | void,
  deps: any[] = [],
): (...args: Args) => void {
  const store = React.useContext(reatomContext)

  return React.useCallback(
    bindActionCreator(store, actionCreator),
    deps.concat(store),
  )
}

type ActionCreators<T extends any> = {
  [K in keyof T]: T[K] extends (...a: infer Args) => Action
    ? (...args: Args) => void
    : never
}

export function useAtom<T extends Atom>(
  atom: T,
  deps: any[] = [],
): [state: AtomState<T>, bindedActionCreators: ActionCreators<T>] {
  const store = React.useContext(reatomContext)

  const result = React.useMemo(
    () =>
      [
        {
          getCurrentValue: () => getState(atom, store),
          subscribe: (cb: () => any) => store.subscribe(atom, cb),
        },
        Object.entries(atom).reduce((acc, [k, ac]) => {
          // @ts-expect-error
          if (isActionCreator(ac)) acc[k] = bindActionCreator(store, ac)
          return acc
        }, {} as ActionCreators<T>),
      ] as const,
    deps.concat([atom, store]),
  )

  return [useSubscription(result[0]), result[1]]
}
