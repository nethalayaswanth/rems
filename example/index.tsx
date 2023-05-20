import ext from "../src/index";
import "./styles.css";

const store = ext({
  count: 0,
  name: "mony",
  text: "nothing",

  nested: {
    count: 0,
    name: "mony",
    text: "nothing",

    deepNested: {
      count: 0,
      name: "mony",
      text: "nothing",

      extremelyNested: {
        count: 0,
        text: "mony",
        inc: () => store.nested.deepNested.extremelyNested.count++,
        dec: () => store.nested.deepNested.extremelyNested.count--
      }
    }
  },
  inc: () => (store.nested.deepNested.extremelyNested.text = "tony"),
  user: { text: "sony" }
});

function Text() {
  console.log("<Text />");
  const text = store.name;

  return <p>{text}</p>;
}

// only when count updates, re-render
function Count() {
  const {
    nested: {
      deepNested: {
        extremelyNested: { count }
      }
    }
  } = store;
  console.log("<Count />", count);
  return (
    <>
      {" "}
      <p>{count}</p>{" "}
    </>
  );
}
function CounterTwo() {
  console.log("<CounterTwo />");
  const { count } = store;

  return (
    <>
      {" "}
      <p>{count}</p>{" "}
    </>
  );
}

// no data in UI, no re-render
function Control() {
  console.log("<Control />");
  return (
    <>
      <button onClick={() => {}}>add</button>
      <button onClick={store.inc}>inc</button>
      <button onClick={store.nested.deepNested.extremelyNested.inc}>+</button>
      <button onClick={store.nested.deepNested.extremelyNested.dec}>-</button>
    </>
  );
}

export default function App() {
  console.log("<App />");
  return (
    <>
      <Text />
      <Count />
      <CounterTwo />
      <Control />
    </>
  );
}

// no text update, no re-render
