import { useState } from 'react'
import PropTypes from 'prop-types'

const Blog = ({ blog, addLike, remove, currentUser }) => {
  const [showDetails, setShowDetails] = useState(false)

  const showDeleteButton = currentUser === blog.user.username

  return (
    <div className="blog">
      <div>
        {blog.title} {blog.author}
        <button
          data-testid="viewDetailsButton"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'hide' : 'view'}
        </button>
      </div>
      {showDetails && (
        <div>
          <p>{blog.url}</p>
          <p>
            likes <span data-testid="likes-count">{blog.likes}</span>
          </p>
          <button data-testid="likesButton" onClick={addLike}>
            like
          </button>
          <p>{blog.user.name}</p>
          {showDeleteButton && (
            <button data-testid="delete-button" onClick={remove}>
              delete
            </button>
          )}
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
