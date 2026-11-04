const request = require('supertest');
const app = require('../src/app');

test('hello should escape html sent in the name', async () => {
  const attack = '<script>alert(1)</script>';
  const res = await request(app).get('/hello').query({ name: attack });

  expect(res.status).toBe(200);
  expect(res.text).not.toContain('<script>');
  expect(res.text).toContain('&lt;script&gt;');
});

test('ping should reject a command injection', async () => {
  const res = await request(app)
    .get('/ping')
    .query({ host: '127.0.0.1; id' });

  expect(res.status).toBe(400);
  expect(res.text).toContain('invalide');
});

test('prefs should ignore properties that are not expected', async () => {
  const res = await request(app)
    .get('/prefs')
    .query({ theme: 'dark', admin: 'true', constructor: 'test' });

  expect(res.status).toBe(200);
  expect(res.body).toEqual({ theme: 'dark', lang: 'fr' });
  expect(res.body.admin).toBeUndefined();
});
