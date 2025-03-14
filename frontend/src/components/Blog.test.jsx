import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Blog from './Blog'
import { expect } from 'vitest'
import userEvent from '@testing-library/user-event'

test('renders blogs title and author', () => {
  const blog = {
    author: 'CR7',
    title: 'THE GOAT',
    url: 'madrid.com',
    likes: 33,
    user: {
      username: 'tumadre',
    },
  }
  const { container } = render(<Blog blog={blog} />)

  const div = container.querySelector('.blog')
  expect(div).toHaveTextContent('CR7')
  expect(div).toHaveTextContent('THE GOAT')
  expect(div).not.toHaveTextContent('madrid.com')
  expect(div).not.toHaveTextContent('33')
})

test('URL and likes shown after clicking', async () => {
  const blog = {
    author: 'CR7',
    title: 'THE GOAT',
    url: 'madrid.com',
    likes: 33,
    user: {
      username: 'tumadre',
    },
  }

  const { container } = render(<Blog blog={blog} />)
  const user = userEvent.setup()
  const button = screen.getByText('view')
  await user.click(button)

  const div = container.querySelector('.blog')

  expect(div).toHaveTextContent('madrid.com')
  expect(div).toHaveTextContent('33')
})
