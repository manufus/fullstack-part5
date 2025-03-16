const blogsRouter = require('express').Router()
const { request } = require('express')
// const { request, response } = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body
  const user = await User.findById(request.user)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id,
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  // Add this line to populate user data before sending response
  const populatedBlog = await Blog.findById(savedBlog._id).populate('user', {
    username: 1,
    name: 1,
  })

  response.status(201).json(populatedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  // Compare blog creator's ID with authenticated user's ID
  if (blog.user.toString() !== request.user.toString()) {
    return response
      .status(401)
      .json({ error: 'only the creator can delete blogs' })
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

// blogsRouter.patch('/:id', async (request, response) => {
//   const { id } = request.params
//   const { likes } = request.body

//   const updatedBlog = await Blog.findByIdAndUpdate(
//     id,
//     { likes },
//     { new: true, runValidators: true }
//   )

//   if (!updatedBlog) {
//     return response.status(404).end()
//   }

//   response.json(updatedBlog)
// })

blogsRouter.put('/:id', userExtractor, async (request, response) => {
  const { id } = request.params
  const body = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(
    id,
    {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
    },
    { new: true, runValidators: true }
  ).populate('user', { username: 1, name: 1 })

  if (!updatedBlog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  response.json(updatedBlog)
})

module.exports = blogsRouter
