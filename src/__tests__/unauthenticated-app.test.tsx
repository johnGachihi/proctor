import { render } from '@testing-library/react'
import UnauthenticatedApp from '../unauthenticated-app'
import AppProviders from '../contexts'
import client from '../network/client'
import React from 'react'

jest.mock('../network/client')

function renderUI() {
  client.get.mockImplementationOnce(() =>
    Promise.reject({ unauthenticated: true })
  )
  return {...render(<UnauthenticatedApp />, { wrapper: AppProviders })}
}

describe('Test unauthenticated-app Login form', () => {
  describe('Failed login', () => {
    test('Username error message shown', async () => {
      const { findByRole, findByText } = renderUI()

      client.get.mockImplementationOnce(() =>
        Promise.reject({ fields: { email: ['Invalid']}})
      );

      const loginBtn = await findByRole(/button/i, { name: /log in/i })
      loginBtn.click()

      await findByRole(/alert/i)
      await findByText(/Invalid/i)
    })

    test('Password error message shown', async () => {
      const { findByText, findByRole } = renderUI()
      
      client.get.mockImplementationOnce(() =>
        Promise.reject({ fields: { password: ['Invalid']} })
      );
      
      const loginBtn = await findByRole(/button/i, { name: /log in/i })
      loginBtn.click()

      await findByRole(/alert/i)
      await findByText(/Invalid/i)
    })
  })
})
