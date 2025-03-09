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
        <h2>Login</h2>
        username
        <input
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  )

  const sendBlog = (blogObject) => {
    blogFormRef.current.toggleVisibility()
    try {
      blogService.create(blogObject).then((returnedBlog) => {
        setBlogs(blogs.concat(returnedBlog))
        setNotficationMessage('blog successfully created')
        setTimeout(() => {
          setNotficationMessage('')
        }, 4000)
      })
    } catch (error) {
      setNotficationMessage(error)
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
          <button onClick={handleLogout} type="submit">
            logout
          </button>
          <Togglable buttonLabel="New Blog" ref={blogFormRef}>
            <BlogForm createBlog={sendBlog} />
          </Togglable>
        </div>
      )}
      <div>
        <h2>Blogs</h2>
        {blogs.map((blog) => (
          <Blog key={blog.id} blog={blog} />
        ))}
      </div>
    </div>
  )
}

export default App
