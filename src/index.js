import { editDOM, captureScore } from './lib/util.js';
import * as store from './lib/store.js';

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

function onFinish({ scores }) {
  const id = 'email';
  let input = document.createElement('input');
  let label = document.createElement('label');
  let labelText = document.createTextNode(
    'Tell us where can we send the result of your test 📨'
  );
  let scoreboard = document.createElement('h3');
  let sbText = document.createTextNode(scores.toString());

  input.type = id;
  input.id = id;
  input.placeholder = 'email@example.com';
  label.htmlFor = id;
  label.style.display = 'block';

  editDOM('form', 'replaceWith', label);
  editDOM('label', 'append', labelText);
  editDOM('label', 'after', input);
  editDOM('input', 'after', scoreboard);
  editDOM('h3', 'append', sbText);
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
});
