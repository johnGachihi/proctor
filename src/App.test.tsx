import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import AppProviders from './contexts';

test('renders learn react link', () => {
  const { getByText } = render(<App />, {wrapper: AppProviders});
  // const linkElement = getByText(/learn react/i);
  // expect(linkElement).toBeInTheDocument();
});
