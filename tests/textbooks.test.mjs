import test from 'node:test';
import assert from 'node:assert/strict';
import {answer, seedState} from '../model.mjs';

test('textbook questions return topic explanations and the correct Balbharati reference', () => {
  for (const [question, detail, file] of [
    ['What is a rights issue?', /existing shareholders/, '1203020417'],
    ['Explain OCM unity of command', /one superior/, '1203020416'],
    ['What is a primary key in IT?', /identifies a row uniquely/, '1203010499'],
    ['What is the percentage formula for price elasticity?', /percentage change in quantity/, '1203020029'],
  ]) {
    const reply = answer(seedState(), question);
    assert.match(reply, detail);
    assert(reply.includes(`https://books.ebalbharati.in/pdfs/${file}.pdf`));
  }
});

test('chapter numbering, practicals and saved records remain distinct', () => {
  const state = seedState();
  assert.match(answer(state, 'Economics chapter 3B'), /Elasticity of Demand/);
  assert.match(answer(state, 'Economics chapter 4'), /Supply Analysis/);
  assert.match(answer(state, 'IT practicals'), /12 skill sets/);
  assert.match(answer(state, 'What is my Economics exam portion?'), /exam and portion section is empty/);
  assert.match(answer(state, 'Explain an unknown topic in SP'), /couldn’t match/);
});
