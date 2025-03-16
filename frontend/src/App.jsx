import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import loginService from './services/login'
import blogService from './services/blogs'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [user, setUser] = useState(null)
  const [password, setPassword] = useState('')
  const [notificationMessage, setNotficationMessage] = useState('')

  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs))
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username,
        password,
      })
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      setNotficationMessage('login successful')
      setTimeout(() => {
        setNotficationMessage('')
      }, 4000)
    } catch (exception) {
      setNotficationMessage('wrong credentials')
      setTimeout(() => {
        setNotficationMessage('')
      }, 4000)
    }
  }

  const handleLogout = (event) => {
    event.preventDefault()

    try {
      window.localStorage.removeItem('loggedBlogappUser')
      setUser(null)
      setNotficationMessage('logout successful')
      setTimeout(() => {
        setNotficationMessage('')
      }, 4000)
    } catch (error) {
      setNotficationMessage(error)
      setTimeout(() => {
        setNotficationMessage('')
      }, 4000)
    }
  }

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        <h2>Login form</h2>
        username
        <input
          type="text"
          value={username}
          placeholder="username"
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          type="password"
          value={password}
          placeholder="password"
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">submit login</button>
    </form>
  )

  const sendBlog = async (blogObject) => {
    try {
      blogFormRef.current.toggleVisibility()
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnedBlog))
      setNotficationMessage('blog successfully created')
      setTimeout(() => {
        setNotficationMessage('')
      }, 4000)
    } catch (error) {
      setNotficationMessage(error.message)
      setTimeout(() => {
        setNotficationMessage('')
      }, 4000)
    }
  }

  const addLike = async (blog) => {
    try {
      const updatedBlog = { ...blog, likes: blog.likes + 1 }
      const returnedBlog = await blogService.update(blog.id, updatedBlog)
      setBlogs(blogs.map((b) => (b.id === blog.id ? returnedBlog : b)))
    } catch (error) {
      setNotficationMessage('Error updating likes')
      setTimeout(() => {
        setNotficationMessage('')
      }, 4000)
    }
  }

  const remove = async (id) => {
    try {
      if (window.confirm('Do you want to remove the blog?')) {
        await blogService.remove(id)
        setBlogs(blogs.filter((b) => b.id !== id))
        setNotficationMessage('Blog removed successfully')
        setTimeout(() => {
          setNotficationMessage('')
        }, 4000)
      }
    } catch (error) {
      setNotficationMessage('Error removing blog')
      setTimeout(() => {
        setNotficationMessage('')
      }, 4000)
    }
  }

  return (
    <div>
      <Notification message={notificationMessage} />
      {user === null ? (
        loginForm()
      ) : (
        <div>
          <p>{user.name} logged-in</p>
          <button
            data-testid="logout-button"
            onClick={handleLogout}
            type="submit"
          >
            logout
          </button>
          <Togglable buttonLabel="New Blog" ref={blogFormRef}>
            <BlogForm createBlog={sendBlog} />
          </Togglable>
          <div className="blog-lists">
            <h2>Blogs</h2>
            {blogs
              .sort((a, b) => b.likes - a.likes)
              .map((blog) => (
                <Blog
                  key={blog.id}
                  blog={blog}
                  addLike={() => addLike(blog)}
                  remove={() => remove(blog.id)}
                  currentUser={user.username}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
