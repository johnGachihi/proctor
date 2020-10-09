import client from '../client'
import moxios from 'moxios'

describe('Test API client function', () => {
  beforeEach(() => {
    // @ts-ignore
    moxios.install(client)
  })

  afterEach(() => {
    // @ts-ignore
    moxios.uninstall(client)
  })

  it('Returns `data` subset of axios response', (done) => {
    moxios.stubRequest('http://example.com', {
      response: { data: 'foo' }
    })

    client.get('http://example.com').then(res => {
      expect(res.data).toBe('foo')
      done()
    })
  })

  it('Throws error with `{ unauthenticated: true }` when status is 401', done => {
    moxios.stubFailure('post', 'http://example.com', { status: 401 })

    client.post('http://example.com').catch(res => {
      expect(res).toEqual({unauthenticated: true});
      done();
    })
  })

  it('Puts validation errors in err.fields when status is 422', done => {
    moxios.stubFailure('post', 'http://example.com', {
      status: 422,
      response: { errors: { email: ['Invalid email'] }}
    });

    client.post('http://example.com').catch(res => {
      expect(res).toMatchObject({
        fields: { email: ['Invalid email'] }
      })
      done()
    })
  })
})