const { test, after, beforeEach, describe } = require('node:test')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const helper = require('../utils/list_helper')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const initialBlogs = [
  {
    title: 'Title test',
    author: 'Author 1',
    url: 'qwerty.1',
    likes: 1,
  },
  {
    title: 'Title 2',
    author: '2',
    url: 'yuiop.2',
    likes: 2,
  },
  {
    title: 'Title 3',
    author: '3',
    url: 'asdfg.3',
    likes: 3,
  },
]

let token = null

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  // Create test user
  const passwordHash = await bcrypt.hash('testpass', 10)
  const user = new User({ username: 'testuser', passwordHash })
  await user.save()

  // Login and get token
  const response = await api
    .post('/api/login')
    .send({ username: 'testuser', password: 'testpass' })

  token = response.body.token

  const blogObjects = initialBlogs.map(
    (blog) =>
      new Blog({
        ...blog,
        user: user._id,
      })
  )
  const promiseArray = blogObjects.map((blog) => blog.save())
  await Promise.all(promiseArray)
})

test('retrieving blogs as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-type', /application\/json/)
})

test('there are three blogs', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, initialBlogs.length)
})

test('blog identifiers are id', async () => {
  const response = await api.get('/api/blogs')
  const blogs = response.body
  const existeId = blogs.map((blog) => Boolean(blog.id))
  assert(!existeId.includes(false))
})

test('new blog post is created', async () => {
  const newBlog = {
    title: 'POST test',
    author: 'Author 4',
    url: 'qwerty.4',
    likes: 4,
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`) // Add token
    .send(newBlog)
    .expect(201)
    .expect('Content-type', /application\/json/)

  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, initialBlogs.length + 1)

  const match = await Blog.find({ title: 'POST test' })
  await api
    .delete(`/api/blogs/${match[0].id}`)
    .set('Authorization', `Bearer ${token}`) // Add token
    .expect(204)
})

// Update likes missing test
test('likes missing, adding 0 instead', async () => {
  const newBlog = {
    title: 'Likes defaulting 0 test',
    author: 'Author 4',
    url: 'qwerty.4',
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`) // Add token
    .send(newBlog)
    .expect(201)
    .expect('Content-type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

// Update missing title/url test
test('title or url missing returns 400 Bad Request', async () => {
  const newBlogNoTitleNoUrl = {
    author: 'Bad Request',
    likes: 33,
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`) // Add token
    .send(newBlogNoTitleNoUrl)
    .expect(400)
})

// Add new test for unauthorized blog creation
test('adding blog fails with 401 if token not provided', async () => {
  const newBlog = {
    title: 'Test without token',
    author: 'No Auth',
    url: 'noauth.com',
    likes: 0,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await Blog.find({})
  assert.strictEqual(blogsAtEnd.length, initialBlogs.length)
})

// Update delete test
test('deleting a blog', async () => {
  const response = await api.get('/api/blogs')
  const blogToDelete = response.body[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`) // Add token
    .expect(204)

  const blogsAtEnd = await Blog.find({})
  assert.strictEqual(blogsAtEnd.length, initialBlogs.length - 1)
})

test('updating likes of a blog', async () => {
  const response = await api.get('/api/blogs')
  const blogsStart = response.body
  const blogToUpdate = blogsStart[0]

  const blogLikesUpdated = { ...blogToUpdate, likes: blogToUpdate.likes - 33 }

  await api
    .patch(`/api/blogs/${blogToUpdate.id}`)
    .send(blogLikesUpdated)
    .expect(200)

  const responseAfter = await api.get('/api/blogs')
  const blogsAfter = responseAfter.body
  const blogAfter = blogsAfter[0]

  assert.strictEqual(blogAfter.likes, blogToUpdate.likes - 33)
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map((u) => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()
    console.log('!!!', usersAtStart)

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if username is shorter than 3', async () => {
    const usersAtStart = await helper.usersInDb()
    console.log('!!!', usersAtStart)

    const newUser = {
      username: 'a',
    }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    const usersAtEnd = await helper.usersInDb()

    assert.strictEqual(usersAtStart.length, usersAtEnd.length)
    assert(
      result.body.error.includes('username must be longer than 3 characters')
    )
  })
  test('creation fails with proper statuscode and message if password is shorter than 3', async () => {
    const usersAtStart = await helper.usersInDb()
    console.log('!!!', usersAtStart)

    const newUser = {
      username: 'aaaaa',
      password: '0',
    }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    const usersAtEnd = await helper.usersInDb()

    assert.strictEqual(usersAtStart.length, usersAtEnd.length)
    assert(
      result.body.error.includes('password must be longer than 3 characters')
    )
  })
})

after(async () => {
  mongoose.connection.close()
})
