import { editDOM, captureScore } from './lib/util.js';
import * as store from './lib/store.js';

const URL = 'http://localhost:3000/';

async function fetchQuestions() {
  let res = await fetch('data/questions.json');
  return await res.json();
}

function updateForm({ title, text, inFinish }) {
  let legend = document.createElement('legend');
  let para = document.createElement('p');
  let choice = document.querySelector('input[type=radio]:checked');

  legend.textContent = title;
  para.id = 'text';
  para.textContent = text;

  editDOM('legend', 'replaceWith', legend);
  editDOM('#text', 'replaceWith', para);

  // 'checked' attribute is not present when no radio button has been selected
  // either by the user or by default ==> choice is undefined.
  if (choice) choice.checked = false;
  if (inFinish) changeBtn();
}

function changeBtn() {
  let btn = document.createElement('input');
  btn.type = 'submit';
  btn.value = 'Értékelés';
  btn.addEventListener('click', event => {
    try {
      store.emit('finish', ({ scores }) => {
        return { scores: [...scores, captureScore()] };
      });
    } catch (error) {
      console.error(error);
      alert(error);
    } finally {
      event.preventDefault();
    }
  });
  editDOM('input[type=submit]', 'replaceWith', btn);
}

function onStart(state) {
  document.querySelector('#start').remove();
  document.querySelector('form').style.display = '';
  updateForm(state);
}

function onFinish() {
  const id = 'email';
  let form = document.createElement('form');
  let input = document.createElement('input');
  let label = document.createElement('label');
  let labelText = document.createTextNode(
    'Tell us where can we send the result of your test 📨'
  );
  let btn = document.createElement('input');

  input.type = id;
  input.id = id;
  input.placeholder = 'email@example.com';
  label.htmlFor = id;
  label.style.display = 'block';
  btn.type = 'submit';
  btn.value = 'Send';
  btn.addEventListener('click', event => {
    store.emit('send', { email: input.value });
    event.preventDefault();
  });

  editDOM('form', 'replaceWith', form);
  editDOM('form', 'append', label);
  editDOM('label', 'append', labelText);
  editDOM('label', 'after', input);
  editDOM('input[type=email]', 'after', btn);
}

function onSend({ email, scores }) {
  fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers: scores, email }),
  })
    .then(res => res.json())
    .then(console.log('🥳'))
    .catch(err => console.error(err));
}

fetchQuestions().then(questions => {
  const start = 'start';
  const submit = 'submit';

  store.createStore({
    scores: [],
    questionIdx: 0,
    inFinish: false,
    ...questions[0],
  });

  store.on(start, onStart);
  store.on(submit, updateForm);
  store.on('finish', onFinish);
  store.on('send', onSend);
  store.on('secret', onFinish);

  try {
    document
      .querySelector('#start')
      .addEventListener('click', () => store.emit(start, {}));
  } catch (error) {
    console.error(error);
  }

  document
    .querySelector('input[type=submit]')
    .addEventListener('click', event => {
      try {
        store.emit(submit, ({ questionIdx, scores }) => {
          return {
            questionIdx: questionIdx + 1,
            ...questions[questionIdx + 1],
            scores: [...scores, captureScore()],
            inFinish: questions.length - 2 === questionIdx,
          };
        });
      } catch (error) {
        console.error(error);
        alert(error);
      } finally {
        event.preventDefault();
      }
    });

  document.querySelector('#secret button').addEventListener('click', event => {
    store.emit('secret', () => {
      const scores = document.querySelector('#secret input').value.split(' ');
      return { scores };
    });
    event.preventDefault();
  });
});
