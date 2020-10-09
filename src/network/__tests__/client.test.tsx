import client from '../client'
import moxios from 'moxios'

const url = 'http://example.com'

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
    moxios.stubRequest(url, {
      response: { data: 'foo' }
    })

    client.get(url).then(res => {
      expect(res.data).toBe('foo')
      done()
    })
  })

  it('Throws error with `{ unauthenticated: true }` when status is 401', done => {
    moxios.stubFailure('post', url, { status: 401 })

    client.post(url).catch(res => {
      expect(res).toEqual({unauthenticated: true});
      done();
    })
  })

  it('Puts validation errors in err.fields when status is 422', done => {
    moxios.stubFailure('post', url, {
      status: 422,
      response: { errors: { email: ['Invalid email'] }}
    });

    client.post(url).catch(res => {
      expect(res).toMatchObject({
        fields: { email: ['Invalid email'] }
      })
      done()
    })
  })
})