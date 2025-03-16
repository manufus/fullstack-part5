const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Fernando',
        username: 'Alonso',
        password: 'la33la33',
      },
    })
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    const locator = await page.getByText('Login form')
    await expect(locator).toBeVisible()
    await expect(page.getByText('username')).toBeVisible()
    await expect(page.getByText('password')).toBeVisible()
    await expect(page.getByText('submit login')).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByPlaceholder('username').fill('Alonso')
      await page.getByPlaceholder('password').fill('la33la33')
      await page.getByText('submit login').click()

      await expect(page.getByText('login successful')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByPlaceholder('username').fill('Nofunciona')
      await page.getByPlaceholder('password').fill('la33la33')
      await page.getByText('submit login').click()

      await expect(page.getByText('wrong credentials')).toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await page.getByPlaceholder('username').fill('Alonso')
      await page.getByPlaceholder('password').fill('la33la33')
      await page.getByText('submit login').click()
    })

    test('a new blog can be created', async ({ page }) => {
      const blogCreate = {
        title: 'Carlos',
        author: 'Sainz',
        url: 'williams.com',
      }
      await page.getByText('New Blog').click()
      await page.getByPlaceholder('title of the blog').fill(blogCreate.title)
      await page.getByPlaceholder('author of the blog').fill(blogCreate.author)
      await page.getByPlaceholder('url of the blog').fill(blogCreate.url)
      await page.getByText('add blog').click()

      const blogsDiv = page.locator('.blog-lists')
      await page.getByText('view').click()
      await expect(blogsDiv).toContainText('Carlos')
      await expect(blogsDiv).toContainText('Sainz')
      await expect(blogsDiv).toContainText('williams.com')
    })

    test('a blog can be liked', async ({ page }) => {
      const blogCreate = {
        title: 'Carlos',
        author: 'Sainz',
        url: 'williams.com',
      }
      await page.getByText('New Blog').click()
      await page.getByPlaceholder('title of the blog').fill(blogCreate.title)
      await page.getByPlaceholder('author of the blog').fill(blogCreate.author)
      await page.getByPlaceholder('url of the blog').fill(blogCreate.url)
      await page.getByText('add blog').click()

      // Show blog details first
      await page.getByText('view').click()

      // Get initial likes count
      const likesCount = await page.getByTestId('likes-count')
      const likesBefore = await likesCount.textContent()

      // Click like button and wait for update
      await page.getByTestId('likesButton').click()
      // Wait for the count to update
      await expect(likesCount).not.toHaveText(likesBefore)

      // Verify the count increased
      const likesAfter = await likesCount.textContent()
      expect(Number(likesAfter)).toBe(Number(likesBefore) + 1)
    })

    test('a user can delete its blog', async ({ page }) => {
      const blogCreate = {
        title: 'Carlos',
        author: 'Sainz',
        url: 'williams.com',
      }
      await page.getByText('New Blog').click()
      await page.getByPlaceholder('title of the blog').fill(blogCreate.title)
      await page.getByPlaceholder('author of the blog').fill(blogCreate.author)
      await page.getByPlaceholder('url of the blog').fill(blogCreate.url)
      await page.getByText('add blog').click()

      // Show blog details first
      await expect(page.getByText('Carlos')).toBeVisible()
      await page.getByText('view').click()

      // Delete the blog
      const deleteButton = await page.getByTestId('delete-button')
      await expect(deleteButton).toBeVisible()

      page.on('dialog', async (dialog) => {
        expect(dialog.type()).toContain('confirm')
        expect(dialog.message()).toContain('Do you want to remove the blog?')
        await dialog.accept()
      })
      await deleteButton.click()

      await expect(page.getByText('Carlos')).not.toBeVisible()
    })

    test('different user cannot delete others blog', async ({
      page,
      request,
    }) => {
      const blogCreate = {
        title: 'Carlos',
        author: 'Sainz',
        url: 'williams.com',
      }
      await page.getByText('New Blog').click()
      await page.getByPlaceholder('title of the blog').fill(blogCreate.title)
      await page.getByPlaceholder('author of the blog').fill(blogCreate.author)
      await page.getByPlaceholder('url of the blog').fill(blogCreate.url)
      await page.getByText('add blog').click()

      // Show blog details first
      await expect(page.getByText('Carlos')).toBeVisible()
      await page.getByText('view').click()
      const deleteButton = await page.getByTestId('delete-button')
      await expect(deleteButton).toBeVisible()

      // Log out and log in with second user
      await page.getByTestId('logout-button').click()
      await expect(page.getByText('logout successful')).toBeVisible()
      await request.post('http://localhost:3003/api/users', {
        data: {
          name: 'Marc',
          username: 'Marquez',
          password: '90victorias',
        },
      })
      await page.goto('http://localhost:5173')

      await page.getByPlaceholder('username').fill('Marquez')
      await page.getByPlaceholder('password').fill('90victorias')
      await page.getByText('submit login').click()

      await expect(page.getByText('Carlos')).toBeVisible()
      await page.getByText('view').click()
      await expect(page.getByTestId('delete-button')).not.toBeVisible()
    })
  })
})
