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

test('Like button clicked twice', async () => {
  const blog = {
    author: 'CR7',
    title: 'THE GOAT',
    url: 'madrid.com',
    likes: 33,
    user: {
      username: 'tumadre',
      name: 'Cristiano',
    },
  }

  const mockHandler = {
    addLike: vi.fn(),
    remove: vi.fn(),
  }

  render(
    <Blog
      blog={blog}
      addLike={mockHandler.addLike}
      remove={mockHandler.remove}
      currentUser="tumadre"
    />
  )

  const user = userEvent.setup()
  const showDetailsButton = screen.getByText('view')
  await user.click(showDetailsButton)

  const likeButton = screen.getByText('like')
  await user.click(likeButton)
  await user.click(likeButton)

  expect(mockHandler.addLike.mock.calls).toHaveLength(2)
})
