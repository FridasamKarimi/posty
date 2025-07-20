import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { postService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

function PostView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const postData = await postService.getPost(id);
        setPost(postData);
        const commentData = await postService.addComment(id, {}); // Fetch comments via a separate GET if needed
        setComments(commentData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await postService.addComment(id, {
        content: newComment,
        author: user.username,
      });
      setComments([...comments, response]);
      setNewComment('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      {post.featuredImage && <img src={`${import.meta.env.VITE_API_URL}/${post.featuredImage}`} alt="Featured" />}
      <h2>Comments</h2>
      {comments.map((comment) => (
        <div key={comment._id}>
          <p>{comment.content}</p>
          <small>By {comment.author} on {new Date(comment.createdAt).toLocaleDateString()}</small>
        </div>
      ))}
      {user && (
        <form onSubmit={handleCommentSubmit}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <button type="submit">Post Comment</button>
        </form>
      )}
    </div>
  );
}

export default PostView;