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
}

let exercises: Exercise[] = [
  {
    expect_print: '7',
    code: 'console.log(3 + _)',
  },
  {
    expect_print: '9',
    code: 'console.log(5 + _)',
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
      {mapArray(exercises, exercise => {
        return (
          <div className="exercise">
            <div class="exercise-message">
              expected to{' '}
              <span class="expected-result">
                print: {exercise.expect_print}
              </span>
            </div>
            <code>
              {mapArray(
                exercise.code.split('_'),
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
