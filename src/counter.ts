export function setupCounter(element: HTMLButtonElement) {
  let counter = 0
  const setCounter = (count: number) => {
    counter = count
    element.innerHTML = `Count is ${counter}`
  }
  element.addEventListener('click', () => setCounter(counter + 1))
  setCounter(0)
}

// This is just here so it looks like i did a lot of things
// for changes, this is completely irrelevant, aethelclock.ts is the engine, main.ts is the main, duhh
// Blah blah blah blah
// Niks wuz hier
