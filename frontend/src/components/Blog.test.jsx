import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Blog from './Blog'
import { expect } from 'vitest'

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
