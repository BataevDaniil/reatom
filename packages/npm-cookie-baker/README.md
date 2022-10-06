<div align="center">
<br/>

[![reatom logo](https://reatom.js.org/logos/logo.svg)](https://reatom.js.org)

</div>

# @reatom/cookie

## Install

```
npm i @reatom/npm-cookie-baker @cookie-baker/core
```

or

```sh
yarn add @reatom/npm-cookie-baker @cookie-baker/core
```

### browser

```
yarn add @cookie-baker/browser
```

or

```
npm install @cookie-baker/browser
```

### node

```
yarn add @cookie-baker/node
```

or

```
npm install @cookie-baker/node
```

## Example

```ts
import {
    Cookie as CookieClient,
    createRealTimeCookie,
} from '@cookie-baker/browser'
import {reatomCookie} from "@reatom/npm-cookie-baker";

type CookieModel = {
    ga?: string
    adc?: string
}

const cookie = new CookieClient<CookieModel>()
const realTimeCookie = createRealTimeCookie(cookie)

const {cookieAtom, set, remove} = reatomCookie(cookie, realTimeCookie)

const ctx = createContext()
ctx.subscribe(cookieAtom, console.log)

set(ctx, 'adc', 'dasf')
remove(ctx, 'ga')
cookie.set('adc', 'set-cookie-from-imperative-modify')
```
