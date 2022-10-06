---
layout: ../../layouts/Layout.astro
title: logger
description: Reatom for logger
---  

There is no docs yet, but you could check tests instead:
```ts
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { action, atom, createCtx } from '@reatom/core'
import { mapPayloadAwaited, toAtom } from '@reatom/lens'
import { sleep } from '@reatom/utils'
import { mockFn } from '@reatom/testing'

import { connectLogger, createLogBatched } from '.'

test(`base`, async () => {
  const asyncResAtom = atom(0)
  const a2 = atom(0, `test`)
  const ctx = createCtx()
  const log = mockFn()

  ctx.get(asyncResAtom)
  ctx.get(a2)

  connectLogger(ctx, { log })

  ctx.get(() => {
    asyncResAtom(ctx, 1)
    a2(ctx, 2)
  })

  assert.equal(log.lastInput().changes, {
    [a2.__reatom.name!]: { cause: `self`, state: 2, stateOld: 0 },
  })

  ctx.get(() => {
    a2(ctx, 10)
    a2(ctx, 20)
  })

  assert.equal(log.lastInput().changes, {
    [a2.__reatom.name!]: [
      { cause: `self`, state: 10, stateOld: 2 },
      { cause: `self`, state: 20, stateOld: 2 },
    ],
  })
  ;`👍` //?
})

test(`cause`, async () => {
  // should correct calculate cause for complex async transactions
  const doAsync = action(
    (ctx, v: number) => ctx.schedule(() => Promise.resolve(v)),
    `doAsync`,
  )
  const doAsyncRes = doAsync.pipe(mapPayloadAwaited((ctx, v) => v, `doAsyncRes`))
  const asyncResAtom = doAsyncRes.pipe(toAtom(0, `asyncResAtom`))

  const ctx = createCtx()
  const log = mockFn()

  connectLogger(ctx, { log })

  ctx.subscribe(asyncResAtom, () => {})

  doAsync(ctx, 123)

  await sleep(5)

  assert.equal(log.lastInput().changes, {
    doAsyncRes: { state: [123], stateOld: [], cause: 'self <-- doAsync' },
    asyncResAtom: {
      state: 123,
      stateOld: 0,
      cause: 'self <-- doAsyncRes <-- doAsync',
    },
  })
  ;`👍` //?
})

test(`should skip logs without state changes`, async () => {
  const a = atom(0, 'nAtom')
  const ctx = createCtx()
  const log = mockFn()

  ctx.subscribe(a, () => {})

  connectLogger(ctx, {
    log: createLogBatched(log),
  })

  a(ctx, 1)

  ctx.get(a)

  a(ctx, 1)

  assert.is(log.calls.length, 0)

  await sleep()

  assert.is(log.calls.length, 1)

  a(ctx, 1)

  assert.is(log.calls.length, 1)

  await 0

  assert.is(log.calls.length, 1)

  a(ctx, 2)

  ctx.get(() => {
    ctx.get(a)
  })

  ctx.get(() => {
    atom(0, 'nAtom1')(ctx, 1)
    ctx.get(a)
    atom(0, 'nAtom2')(ctx, 1)
    a(ctx, 3)
  })

  a(ctx, 3)

  assert.is(log.calls.length, 1)

  await sleep()

  assert.is(log.calls.length, 2)
  assert.equal(log.lastInput(), {
    '[1] nAtom': { state: 2, stateOld: 1, cause: 'self' },
    '[2] nAtom1': { state: 1, stateOld: undefined, cause: 'self' },
    '[2] nAtom2': { state: 1, stateOld: undefined, cause: 'self' },
    '[2] nAtom': { state: 3, stateOld: 2, cause: 'self' },
  })
  ;`👍` //?
})

test.run()

```
