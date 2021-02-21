export function editDOM(place, insertion, elements) {
  if ('string' === typeof place) place = document.querySelector(place);
  if ('string' === typeof insertion) insertion = Element.prototype[insertion];

  if ('undefined' === elements) {
    insertion.call(place);
    return;
  }
  if ('[object Array]' !== Object.prototype.toString.call(elements)) {
    insertion.call(place, elements);
    return;
  }
  insertion.call(place, ...elements);
}

export function captureScore() {
  let chosen = document.querySelector('input[type=radio]:checked');
  if (null === chosen) throw 'No answer has been chosen!'; //TODO Ask user to chose!
  return chosen.value;
}
