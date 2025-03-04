# Student Learning Notes

You're encouraged to take notes, but we don't want that to get in the way of listening to the lectures. So, we made notes for you. Feel free to edit as you wish!

---

## Lesson 1: Thinking in React

- We like React because it's Composable and Declarative
  - Composable: You can build small re-usable parts which can be used to build bigger, more complex things
  - Declarative: We write in a style where we say "what" we want. When we write HTML, `<select>` is declarative because we simply describe the dropdown menu we want but without programming "how" it works. React can be considered declarative in two ways. First, when we write JSX we are describing what we want the UI to be but we're not working directly on the DOM. React does the DOM stuff for us so we could say that our instructions are declarative and React does the real DOM work which is imperative. Second, we can abstract UI into small components. We might have a special `<RemoveButton />` that can be used as an element declaratively and another React programmer programs how it works.
- JSX is a syntax for easily creating nested function calls for each DOM element we want to make. Babel is a compiler that converts each JSX element into a `_jsx('div')` function call.
- The return value of a component (JSX turned into `_jsx('div')`) is like an "instruction manual" for how to create DOM elements.
- In a typical React application, using `ReactDOM.createRoot()` to mount the application is used once. When components in our tree re-render and provide new instructions form JSX, React will take care of updating the DOM for us.
- A "component" is a function or a class that renders instructions for the DOM via JSX. In a function component, the JSX is simply returned. In a class component, there is a render method that returns JSX. While function components are preferred by most React developers, you can still use class components and both component types can be used together on the same application.

Docs: https://reactjs.org/docs/introducing-jsx.html

JSX Confusing Parts: https://reacttraining.com/blog/jsx-the-confusing-parts/

---

## Lesson 2: State and Refs

- `useState` Format: `const [value, setValue] = useState(defaultValue)`.
- State can be considered any variable that changes over time in the component.
- The entire component re-renders (the component function gets called again) each time state changes.
- Multiple state values are done with multiple `useState`.
- The order of hook declarations matters to React, so we can't "conditionalize" calls to `useState`
- A good mental model for React is that UI is a function of state. In other words:

  - The component renders for the first time and JSX is created from initial props and state.
  - When state changes (often times through events like clicks), React calls our component function again and ensures the state variables reflect what was changed.
  - This re-render will mean new JSX that is returned reflects the new state. It's like a new instruction manual for what does change in the DOM.
  - React takes the previously returned JSX and the new JSX and finds the differences (called a diff). Only the things that are different are used to change the real DOM. This makes React very fast.

- Docs: https://reactjs.org/docs/hooks-state.html

---

### Forms

- Form fields in React are either "controlled" or "uncontrolled".
- By default, fields are "uncontrolled". This means that React is not controlling the value of the field. The user types into the field and whatever they type is the value (just like any HTML form made in the last 25 years). It's "uncontrolled" because React is not controlling the value.
- There are several ways to access the values of uncontrolled fields, but one common way in React is with refs (useRef)
- Refs are used to access anything in the DOM in a more "imperative" way.
- If we do a `onChange` event for the field and take what the user types and turn that into state, then we take the state and put that back into the field's value prop, then you can say React is controlling the value. Now it's a "controlled" field. Even though it might seem as though the user is still controlling the value, React _could_ adjust, format, or change the value if we program it to do so. So it's really React that's controlling the value the user sees.
- Pros and Cons:

  - Uncontrolled fields are easier to set up because you just type `<input />` and you're done. Whereas with controlled you have to setup the `onChange` and `value` props for the field so that state orchestrates the value of the field.
  - Uncontrolled fields give you less abilities. If you need something else to set the value of the field, then we can't use uncontrolled. Also, if we want to read the value of an uncontrolled field (for form submissions), then we have to figure out a way to read the DOM (probably with refs) whereas controlled fields already have their stateful values ready for us.

- Docs for Refs: https://reactjs.org/docs/refs-and-the-dom.html
- Docs for Controlled inputs: https://reactjs.org/docs/uncontrolled-components.html

---

### Reducers

```js
// Format:
const [state, dispatch] = useReducer(reducerFunction, initialState)

// Implementation
const [state, dispatch] = useReducer(
  (oldState, action) => {
    switch (action) {
      case 'SOMETHING_THAT_HAPPENED':
        return { ...oldState, ...changes } // make any additional state changes
      default:
        return state
    }
  },
  {
    // initial state
  }
)

dispatch({ type: 'SOMETHING_THAT_HAPPENED' })
```

- `useReducer` is the "reducer pattern" similarly found in Redux, but for local state. It's an alternative to using `useState`. `useReducer` can be good for complex local state.
- `useReducer` docs: https://reactjs.org/docs/hooks-reference.html#usereducer

## Lesson 3: Client Side Routing

The "Overview" page from the RR6 docs are better notes that we could write here, so lets use them: https://reactrouter.com/docs/en/v6/getting-started/overview

## Lesson 4: Side Effects

- `useEffect` Format: `useEffect(fn, [dependencyArray])`
- `useEffect` is used for side effects. Typically this means we want to do something outside of our component, like a network request or perhaps with cookies/localStorage, and we want to do that side effect any time state changes.
- The effect callback runs when the component first mounts and then anytime the values in the dependency array change. Having an empty dependency array is a way to ensure the effect only runs once.
- However, be careful: any variables that your effect uses (depends on) need to be stated in your dependency array. With the older mental model of time and `componentDidMount`, we thought in terms of "this just needs to happen once when we mount". But now with `useEffect` we need to think in terms of "anytime state changes, what do I need to do". Therefore you'll probably need to put values in your dependency array often.

```js
useEffect(fn) // runs when a component mounts, and any state changes
useEffect(fn, []) // runs just when a component mounts
useEffect(fn, [some, example, state]) // runs when a component mounts, and when `some` or `example` or `state` changes.
```

- For those who have some React experience, it's easy to compare `useEffect` to things like `componentDidMount`, `componentDidUpdate` and `componentWillUnmount`. However, you might want to consider these differences - https://reacttraining.com/blog/useEffect-is-not-the-new-componentDidMount/
- Avoid infinite loops: If an effect has no dependency array and also sets state, this will cause an infinite loop. Imagine that the component mounts which calls the effect. Then state is changed which leads to a re-render which means the effect will be called again because there was no dependency array telling react not to run the effect again. Then since the effect runs again and sets state, this creates an infinite loop.
- In the callback for the effect, you can either return no value or return a function. If a function is returned, it's said to be the "cleanup function". This function is called when the component unmounts or when the dependency array changes.
- When setting state asynchronously in an effect, there's always a chance the component will become unmounted or the dependency array might change before the set state is called. For both cases, we need to use a cleanup function to ensure we're not setting state on the unmounted component or setting state that was based on the previous values of the dependency array. This is how we might prevent this problem with an `isCurrent` variable:

```js
useEffect(() => {
  // 1. The effect first runs so we'll say it's "current"
  let isCurrent = true
  // 2. Go out and get a user on the network
  fetchUser(uid).then((user) => {
    // 5. A moment later, the promise does resolve (the component
    // is no longer mounted though). This condition will prevent us
    // from setting state on an unmounted component.
    if (isCurrent) {
      setUser(user)
    }
  })
  // 3. Here is a function that can be called if we need to
  // cleanup the effect
  return () => {
    // 4. Lets imagine the user leaves the page before the fetchUser
    // promise resolves. This cleanup will be called and set isCurrent
    // to be false.
    isCurrent = false
  }
}, [uid])
```

- https://reacttraining.com/blog/useEffect-is-not-the-new-componentDidMount/
- https://reacttraining.com/blog/when-to-use-functions-in-hooks-dependency-array/
- Docs: "Using the Effect Hook": https://reactjs.org/docs/hooks-effect.html
- A very long but complete guide to useEffect: https://overreacted.io/a-complete-guide-to-useeffect/

## Lesson 5: Context

- Parent components send variables (data) down to their child components via props.
- Data flows Down ("Unidirectional Data Flow"): React's data model is said to be "unidirectional", meaning data flows from parent components down through the tree to child components through props. However, if a prop is passed down from parent to child and the prop is a callback function, then we might say that child components can communicate back up to their parents by calling the function. Some would say that "data flows down, and events flow up" the tree.
- When components need to communicate with other components far away in this tree structure, one solution has been to "lift state" high enough to flow the information down to both components. But this could lead to many levels of "prop drilling" -- the process of passing props deep through the component hierarchy.
- Context is a way to pass data around our app without having to prop drill.
- Context gives us a `<Context.Provider />` component which we can add to the same component that contains the state. Then instead of passing props down through the normal hierarchy, we can pass a `value` into the provider JSX.
- When values are passed into the provider's `value` prop, they can be received at any component below the provider with the `useContext` hook. Components using this hook are referred to as "consumers" of the context.
- When the state changes at the top and is passed down into the provider, the consumers get a re-render to retrieve that new state.

- Docs on "Lifting State": https://reactjs.org/docs/lifting-state-up.html
- `useContext` docs: https://reactjs.org/docs/hooks-reference.html#usecontext

---

## Lesson 6: Data Loading Abstractions

- Many teams make a general abstraction for useEffect and data loading. The one made in the workshop is called usePromise because it's so generic it can actually be used for any promise-based side-effect.
- From that, you can make many custom hooks like:

```js
function useUsers() {
  const p = api.users.getUsers // The promise
  const { results, ...rest } = usePromise(p)
  return { results, ...rest }
}
```

- You can even do some cache-like strategies and fetch from within Context Providers and provide data through context as needed.

### React Query

React Query is a professional cache-based data fetching abstraction so you don't have to make your own. It's also very well known and battle-tested. This could be our `useCourses` instead:

```js
function useUsers() {
  const { data, ...rest } = useQuery('users', () => api.users.getUsers(), {
    staleTime: 1000 * 30,
  })
  return { data, ...rest }
}
```

- Notice both instances of useCourses are abstracting `api.users.getUsers`
- You can fetch data with React Query, or if you want to update your server's data you can keep your cache in sync by doing "mutations" on the cache or invalidate it.
- After reading some docs, here's a nice guide to learn a lot more about React Query: https://tkdodo.eu/blog/practical-react-query. The creator of React Query read it and said it was "Fantastic!!!"

---

## Lesson 7: Performance Optimizations

Keep in mind that the term "stable" in React means that the identity of a variable will not change between re-renders.

```ts
// useMemo calls the fn in the render phase (synchronously) and "memoizes"
// the return value as x in this example based on the input of the dep array.
// This is mostly used for:
// 1. stabilizing values in render phases
// 2. preventing slow pure functions from being called over and over in render phases
const x = useMemo(fn, [])

// useCallback never calls the fn passed in. Instead it "memoizes" the function itself
// by stabilizing it and returning it. This is mostly used for:
// 1. stabilizing functions that will end up in other dependency arrays
// 2. stabilizing functions that will be passed as pros to memoized components
const fn = useCallback(fn, [])

// The memo() HoC function enhances the component so that it itself is memoized and
// will not re-render unless its props change. Remember that functions being passed
// as props may not be stable by default and may need to be wrapped in useCallback
// at the owner level
const MyComponent = React.memo((props) => {
  // ...
})

// useTransition is an opt-in "concurrent-mode" feature of React that allows us to
// designate some state setting as being interruptible. In other words, if frequent
// re-rendering is happening, React can prioritize other state setting
const { startTransition } = useTransition()
setStateA() // High Priority
startTransition(() => {
  setStateB() // Low Priority (Can be interrupted)
})

// This one has little to do with performance, but is used in the lesson. This will
// create a unique id that hydrates correctly if doing SSR->CSR and is mostly used for
// cases where you need an HTML id to be unique (probably for a11y)
const id = useId()
```

## Lesson 8: Testing

- Be sure to see the GUIDE.md in the testing folder for information on setting up unit testing
- The main principal of React unit testing is - Test the component the way the user uses it, not the implementation details of the component.
- In other words, `render(<Comp />)` render the component in the test and issue events onto the component similarly to how the user clicks, submits forms, or uses keyboard events on the component. Then observe the fake DOM in the unit test to see if the component renders what you'd expect. The "fake DOM" is orchestrated through Jest and JSDOM.
- Mock out (with Jest) the React-tree architecture above your component (Context, Redux, etc) or environmental things like the URL, and mock out sub (child) components. This allows you to test your component in isolation.
