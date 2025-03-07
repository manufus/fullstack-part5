const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Blog = require('../models/blog')
// const { request, response } = require('../app')

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (username.length <= 3) {
    return response
      .status(400)
      .json({ error: 'username must be longer than 3 characters' })
  }

  if (password.length <= 3) {
    return response
      .status(400)
      .json({ error: 'password must be longer than 3 characters' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs')
  response.json(users)
})

module.exports = usersRouter
