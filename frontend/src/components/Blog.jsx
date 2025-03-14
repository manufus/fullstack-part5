import { useState } from 'react'
import PropTypes from 'prop-types'

const Blog = ({ blog, addLike, remove, currentUser }) => {
  const [showDetails, setShowDetails] = useState(false)

  const showDeleteButton = currentUser === blog.user.username

  return (
    <div className="blog">
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
          {showDeleteButton && <button onClick={remove}>delete</button>}
        </div>
      )}
    </div>
  )
}

Blog.propTypes = {
  blog: PropTypes.object.isRequired,
  addLike: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  currentUser: PropTypes.string.isRequired,
}

export default Blog
