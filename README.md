<div align="center">
<h1> REMS</h1>

The Simplest React State Manager


**R**eact **E**xternal **M**utable  **S**tore 

(Support React 18, React Native, SSR, Mini Apps)



</div>

---

## Introduction

rems is a simple react external store works using proxy 

works with nested objects

inspired from [resso](https://github.com/nanxiaobei/resso) 

## Features

- Extremely simple 🪩
- Extremely smart 🫙
- Extremely small 🫧

## Install

```sh


# or
npm i rext
```

## Usage

```jsx
import rems from 'rems';
const store = rems({ count: 0, text: 'hello' });
function App() {
  const { count } = store; // value to cause rerender should be destructure on component 
  return (
    <>
      {count}
      <button onClick={() => store.count++}>+</button>
    </>
  );
}
```


## API

**Initialize**

```jsx
import rems from 'rems';
const store = rems({
  count: 0,
  inc: () => {
    const { count } = store; // data in methods must destructure at top, also 🥷
  },
});
```

**Update**

```jsx
// single update → directly assign
store.count = count + 1;
// single update → updater funtion
store('count', (prev) => prev + 1);
// multiple updates
Object.assign(store, { a, b, c });
```

**Use**

```jsx
// data in UI must destructure at top first, since they were injected by useState
function App() {
  const { count } = store; // must at top, or may get React warning (Hooks rules)
}
```



## Re-render on demand

```jsx
// no text update, no re-render
function Text() {
  const { text } = store;
  return <p>{text}</p>;
}
// only when count updates, re-render
function Count() {
  const { count } = store;
  return <p>{count}</p>;
}
// no data in UI, no re-render
function Control() {
  return (
    <>
      <button onClick={store.inc}>+</button>
      <button onClick={() => store.count--}>-</button>
    </>
  );
}
```

## License


