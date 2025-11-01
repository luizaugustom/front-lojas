import { render, screen } from '@testing-library/react'
import Page from './page'

jest.mock('@/components/APITestRunner', () => ({
  APITestRunner: () => <div data-testid="apitestrunner-mock" />,
}))

describe('Test API Page', () => {
  it('renderiza título e componente APITestRunner', () => {
    render(<Page />)
    expect(screen.getByTestId('apitestrunner-mock')).toBeInTheDocument()
  })
})


