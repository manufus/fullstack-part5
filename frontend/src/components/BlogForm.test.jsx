import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { expect, vi } from 'vitest'
import BlogForm from './BlogForm'
import userEvent from '@testing-library/user-event'

test.only('New blog form', async () => {
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

  const createBlog = vi.fn()

  render(<BlogForm createBlog={createBlog} currentUser="tumadre" />)

  const user = userEvent.setup()

  const titleInput = screen.getByPlaceholderText('title of the blog')
  const authorInput = screen.getByPlaceholderText('author of the blog')
  const urlInput = screen.getByPlaceholderText('url of the blog')
  const submitButton = screen.getByText('add blog')

  await user.type(titleInput, `${blog.title}`)
  await user.type(authorInput, `${blog.author}`)
  await user.type(urlInput, `${blog.url}`)
  await user.click(submitButton)

  console.log(createBlog.mock.calls)
  expect(createBlog.mock.calls[0][0].title).toBe('THE GOAT')
  expect(createBlog.mock.calls[0][0].author).toBe('CR7')
  expect(createBlog.mock.calls[0][0].url).toBe('madrid.com')
})
