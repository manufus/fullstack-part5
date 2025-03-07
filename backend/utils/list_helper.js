const User = require('../models/user')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }

  return !blogs || blogs.length === 0
    ? 0
    : blogs.length === 1
    ? blogs[0].likes
    : blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const max = Math.max(...blogs.map((blog) => blog.likes))
  const match = blogs.filter((blog) => blog.likes === max)[0]

  const { _id, url, __v, ...treatedMatch } = match

  return treatedMatch
}

const mostBlogs = (blogs) => {
  const _ = require('lodash')

  const authorsArray = blogs.map((blog) => blog.author)
  const authorCounts = _.countBy(authorsArray, authorsArray.author)
  const max = Math.max(...Object.values(authorCounts))
  getKeyByValue = (object, value) => {
    return Object.keys(object).find((key) => object[key] === value)
  }
  return {
    author: getKeyByValue(authorCounts, max),
    blogs: max,
  }
}

const mostLikes = (blogs) => {
  const _ = require('lodash')
  const authorLikes = _.groupBy(blogs, 'author')
  const summedLikes = Object.entries(authorLikes).map(([author, blogs]) => ({
    author,
    likes: _.sumBy(blogs, 'likes'),
  }))
  const mostLiked = _.maxBy(summedLikes, 'likes')
  return mostLiked || null
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((u) => u.toJSON())
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
  usersInDb,
}
