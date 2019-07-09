const request = require('supertest');

const app = require('../src/app');

describe('GET /api/v1', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        message: 'API - 👋🌎🌍🌏'
      }, done);
  });
});

describe('POST /api/v1/messages', () => {
  it('insert a new message', (done) => {
    const requestObj = {
      name: 'Kostya',
      message: 'Test message',
      latitude: -90,
      longitude: 180
    };

    const responseObj = {
      ...requestObj,
      date: '2019-07-09T06:42:17.831Z',
      _id: '5d2437491c95a46837b3cf4d'
    };

    request(app)
      .post('/api/v1/messages')
      .send(requestObj)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect((res) => {
        res.body._id = '5d2437491c95a46837b3cf4d';
        res.body.date = '2019-07-09T06:42:17.831Z';
      })
      .expect(200, responseObj, done);
  });

  it('can signup with a correct name', (done) => {
    const requestObj = {
      name: 'Kostya',
      message: 'Test message',
      latitude: -90,
      longitude: 180
    };

    const responseObj = {
      ...requestObj,
      date: '2019-07-09T06:42:17.831Z',
      _id: '5d2437491c95a46837b3cf4d'
    };

    request(app)
      .post('/api/v1/messages')
      .send(requestObj)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect((res) => {
        res.body._id = '5d2437491c95a46837b3cf4d';
        res.body.date = '2019-07-09T06:42:17.831Z';
      })
      .expect(200, responseObj, done);
  });
});
