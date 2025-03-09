import { useState } from 'react'

const Blog = ({ blog, addLike, remove }) => {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div>
      <div>
        {blog.title} {blog.author}
        <button onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'hide' : 'view'}
        </button>
      </div>
      {showDetails && (
        <div>
          <p>{blog.url}</p>
          <p>likes {blog.likes}</p>
          <button onClick={addLike}>like</button>
          <p>{blog.user.name}</p>
          <button onClick={remove}>delete</button>
        </div>
      )}
    </div>
  )
}

export default Blog
