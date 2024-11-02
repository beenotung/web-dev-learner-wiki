import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { apiEndpointTitle, title } from '../../config.js'
import Style from '../components/style.js'
import { Context, DynamicContext, getContextFormBody } from '../context.js'
import { mapArray } from '../components/fragment.js'
import { object, string } from 'cast.ts'
import { Link, Redirect } from '../components/router.js'
import { renderError } from '../components/error.js'
import { getAuthUser } from '../auth/user.js'
import { Script } from '../components/script.js'

let pageTitle = 'Learn'
let addPageTitle = 'Add Learn'

let style = Style(/* css */ `
#Learn {

}
.exercise {
  margin: 1rem;
  padding: 1rem;
  border: 1px solid black;
  max-width: 50em;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.exercise textarea {
  background-color: transparent;
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: white;
  height: calc(1rem + 4px);
  width: 1rem;
  padding; 2px;
  font-size: 1rem;
  min-width: 1.5rem;
}
.input-preview {
  width: fit-content;
  display: none;
}
.exercise code {
  font-size: 1rem;
  color: white;
  background-color: rgba(0,0,0,0.8);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: inline-block;
  align-items: end;
  white-space: pre-wrap;
}
.exercise code [contenteditable]{
  min-width: 1rem;
  background-color: rgba(255,255,0,0.2);
  margin: 0 4px;
  text-align: center;
}
.exercise-message {
  background-color: rgba(0,0,0,0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}
`)

type Exercise = {
  expect_print: string
  code: string
  message: string
}

let exercises: Exercise[] = [
  {
    expect_print: '7',
    code: 'console.log(3 + _)',
    message:
      'You need to complete the expression by adding a number that results in the expected output.',
  },
  {
    expect_print: '3',
    code: 'console.log(10 - _)',
    message:
      'Think about what number you need to subtract from 10 to get the expected result.',
  },
  {
    expect_print: '20',
    code: 'console.log(4 * _)',
    message: 'What number should you multiply by 4 to get 20?',
  },
  {
    expect_print: '5',
    code: 'console.log(25 / _)',
    message: 'What number should you divide 25 by to get 5?',
  },
  {
    expect_print: 'Hello World',
    code: 'console.log("Hello" + _)',
    message: 'You need to concatenate two strings to form "Hello World".',
  },
  {
    expect_print: '6',
    code: `
function addTwo(x) {
  return x + 2;
}
console.log(addTwo(_))
    `,
    message:
      'Pass a number to the function so that the result is 6. What should the input be for `x`?',
  },
  {
    expect_print: '12',
    code: `
function multiplyByThree(x) {
  return x * 3;
}
let num = 4;
console.log(multiplyByThree(_))
    `,
    message:
      'Use the existing variable `num` as the argument for the function. Think about how variables are used in functions.',
  },
  {
    expect_print: '0 1 2 3 4',
    code: `
for (let i = 0; i < 5; i++) {
  console.log(_);
}
    `,
    message:
      'What variable is incrementing in the loop? You need to log the value that changes in each iteration.',
  },
  {
    expect_print: 'Banana',
    code: `
let fruits = ['Apple', 'Banana', 'Cherry'];
console.log(fruits[_]);
    `,
    message: 'Arrays are zero-indexed. Which index corresponds to "Banana"?',
  },
  {
    expect_print: '3',
    code: `
let numbers = [10, 20, 30];
console.log(numbers._);
    `,
    message:
      'Use a property of the array to print how many elements are in it.',
  },
  {
    expect_print: '4',
    code: `
let arr = [1, 2, 3];
arr._(4);
console.log(arr.length);
    `,
    message:
      'There is a method that allows you to add an element to the end of the array. Use it to add 4.',
  },
  {
    expect_print: 'Greater than 10',
    code: `
let x = 15;
if (x > _) {
  console.log('Greater than 10');
} else {
  console.log('Less than or equal to 10');
}
    `,
    message:
      'You need to compare `x` with a number to check if it is larger than a certain threshold.',
  },
  {
    expect_print: 'True',
    code: `
let a = 5;
let b = 10;
console.log(a < 10 && _);
    `,
    message:
      'You need to complete the logical expression so that both conditions return true.',
  },
  {
    expect_print: '25',
    code: `
function add(x, y) {
  return x + y;
}
console.log(add(_, 15));
    `,
    message:
      'Complete the function call to make the sum of two numbers equal 25.',
  },
  {
    expect_print: '36',
    code: `
function square(x) {
  return x * x;
}
function addFive(x) {
  return x + 5;
}
console.log(square(addFive(_)));
    `,
    message:
      'Think about how the two functions work together. The input should be a number that, when passed through both functions, results in 36.',
  },
  {
    expect_print: 'John',
    code: `
let person = {
  name: 'John',
  age: 30
};
console.log(person._);
    `,
    message: 'Access the property of the object that stores the person’s name.',
  },
  {
    expect_print: 'Hello, Alice!',
    code: `
let greeter = {
  name: 'Alice',
  greet() {
    return 'Hello, ' + this._ + '!';
  }
};
console.log(greeter.greet());
    `,
    message:
      'In an object method, `this` refers to the object itself. Which property does the method need to access?',
  },
  {
    expect_print: '2,4,6',
    code: `
let numbers = [1, 2, 3];
let doubled = numbers.map(function(num) {
  return _ * 2;
});
console.log(doubled.join(','));
    `,
    message:
      'The `map` function applies a transformation to each element in the array. Use the provided argument to create the desired output.',
  },
  {
    expect_print: '20,30',
    code: `
let numbers = [10, 20, 30];
let filtered = numbers.filter(function(num) {
  return num > _;
});
console.log(filtered.join(','));
    `,
    message:
      'The `filter` method returns elements that meet a condition. What number should you use to filter out values greater than 15?',
  },
  {
    expect_print: 'Data received',
    code: `
function getData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve('Data received'), 1000);
  });
}

async function fetchData() {
  let data = await getData();
  console.log(_);
}
fetchData();
    `,
    message:
      'Fill in the blank to log the result of the resolved promise. Remember, `data` holds the value returned by the promise.',
  },
]

let page = (
  <>
    {style}
    <div id="Learn">
      <h1>{pageTitle}</h1>
      <code>(= _ (not (= 1 nil)))</code>
      <div className="exercise">
        <code>console.log(1 + 1)</code>
        <div class="exercise-message">print: 2</div>
      </div>
      {mapArray(exercises, (exercise, i) => {
        return (
          <div className="exercise">
            <p>
              {i + 1}. {exercise.message}
            </p>
            <div class="exercise-message">
              expected to{' '}
              <span class="expected-result">
                print: {exercise.expect_print}
              </span>
            </div>
            <code>
              {mapArray(
                exercise.code.trim().split('_'),
                part => part,
                <span contenteditable onkeypress="checkInput(event)">
                  0
                </span>,
              )}
              <div id="preview" class="input-preview"></div>
            </code>
            <div>
              <button onclick="run(event)">run</button>
            </div>
            <div class="result exercise-message">Click "run" to see result</div>
            <div class="result-status"></div>
          </div>
        )
      })}
      {Script(/* javascript */ `
      function checkInput(event) {
        if (event.key == 'Enter') {
          event.preventDefault();
          run(event)
        }
      }
      function run(event) {
        let exercise = event.target.closest('.exercise')
        let code = exercise.querySelector('code').innerText
        let expected_result = exercise.querySelector('.expected-result').innerText
        let result = exercise.querySelector('.result')
        let result_status = exercise.querySelector('.result-status')
        console.log('code:', code)
        let log = console.log
        console.log = message => {
          result.textContent = 'print: ' + message
        }
        eval(code)
        console.log = log
        if (result.textContent != expected_result) {
          result_status.textContent = 'incorrect'
          result_status.style.color = 'red'
        } else {
          result_status.textContent = 'correct'
          result_status.style.color = 'green'
        }
      }
      `)}
      <Main />
    </div>
  </>
)

let items = [
  { title: 'Android', slug: 'md' },
  { title: 'iOS', slug: 'ios' },
]

function Main(attrs: {}, context: Context) {
  let user = getAuthUser(context)
  return (
    <>
      <ul>
        {mapArray(items, item => (
          <li>
            {item.title} ({item.slug})
          </li>
        ))}
      </ul>
      {user ? (
        <Link href="/learn/add">
          <button>{addPageTitle}</button>
        </Link>
      ) : (
        <p>
          You can add Learn after <Link href="/register">register</Link>.
        </p>
      )}
    </>
  )
}

let addPage = (
  <div id="AddLearn">
    {Style(/* css */ `
#AddLearn .field {
  margin-block-end: 1rem;
}
#AddLearn .field label input {
  display: block;
  margin-block-start: 0.25rem;
}
#AddLearn .field label .hint {
  display: block;
  margin-block-start: 0.25rem;
}
`)}
    <h1>{addPageTitle}</h1>
    <form method="POST" action="/learn/add/submit" onsubmit="emitForm(event)">
      <div class="field">
        <label>
          Title*:
          <input name="title" required minlength="3" maxlength="50" />
          <p class="hint">(3-50 characters)</p>
        </label>
      </div>
      <div class="field">
        <label>
          Slug*:
          <input
            name="slug"
            required
            placeholder="should be unique"
            pattern="(\w|-|\.){1,32}"
          />
          <p class="hint">
            (1-32 characters of: <code>a-z A-Z 0-9 - _ .</code>)
          </p>
        </label>
      </div>
      <input type="submit" value="Submit" />
      <p>
        Remark:
        <br />
        *: mandatory fields
      </p>
    </form>
  </div>
)

function AddPage(attrs: {}, context: DynamicContext) {
  let user = getAuthUser(context)
  if (!user) return <Redirect href="/login" />
  return addPage
}

let submitParser = object({
  title: string({ minLength: 3, maxLength: 50 }),
  slug: string({ match: /^[\w-]{1,32}$/ }),
})

function Submit(attrs: {}, context: DynamicContext) {
  try {
    let user = getAuthUser(context)
    if (!user) throw 'You must be logged in to submit ' + pageTitle
    let body = getContextFormBody(context)
    let input = submitParser.parse(body)
    let id = items.push({
      title: input.title,
      slug: input.slug,
    })
    return <Redirect href={`/learn/result?id=${id}`} />
  } catch (error) {
    return (
      <Redirect
        href={'/learn/result?' + new URLSearchParams({ error: String(error) })}
      />
    )
  }
}

function SubmitResult(attrs: {}, context: DynamicContext) {
  let params = new URLSearchParams(context.routerMatch?.search)
  let error = params.get('error')
  let id = params.get('id')
  return (
    <div>
      {error ? (
        renderError(error, context)
      ) : (
        <>
          <p>Your submission is received (#{id}).</p>
          <p>
            Back to <Link href="/learn">{pageTitle}</Link>
          </p>
        </>
      )}
    </div>
  )
}

let routes = {
  '/learn': {
    title: title(pageTitle),
    description: 'TODO',
    menuText: pageTitle,
    node: page,
  },
  '/learn/add': {
    title: title(addPageTitle),
    description: 'TODO',
    node: <AddPage />,
    streaming: false,
  },
  '/learn/add/submit': {
    title: apiEndpointTitle,
    description: 'TODO',
    node: <Submit />,
    streaming: false,
  },
  '/learn/result': {
    title: apiEndpointTitle,
    description: 'TODO',
    node: <SubmitResult />,
    streaming: false,
  },
} satisfies Routes

export default { routes }
