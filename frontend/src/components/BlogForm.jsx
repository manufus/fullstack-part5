import { useState } from 'react'
const BlogForm = ({ createBlog }) => {
  const [newBlog, setNewBlog] = useState({
    title: '',
    author: '',
    url: '',
  })

  const handleBlogChange = (event) => {
    const { name, value } = event.target
    setNewBlog({
      ...newBlog,
      [name.toLowerCase()]: value,
    })
  }
  const sendBlog = (event) => {
    event.preventDefault()
    createBlog(newBlog)
    setNewBlog({
      title: '',
      author: '',
      url: '',
    })
  }
  return (
    <form onSubmit={sendBlog} className="form">
      <div>
        title
        <input
          type="text"
          placeholder="title of the blog"
          value={newBlog.title}
          name="title"
          onChange={handleBlogChange}
        />
      </div>
      <div>
        author
        <input
          type="text"
          placeholder="author of the blog"
          value={newBlog.author}
          name="author"
          onChange={handleBlogChange}
        />
      </div>
      <div>
        url
        <input
          type="text"
          placeholder="url of the blog"
          value={newBlog.url}
          name="url"
          onChange={handleBlogChange}
        />
      </div>
      <button type="submit">add blog</button>
    </form>
  )
}
export default BlogForm
