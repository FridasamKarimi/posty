import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postService, categoryService } from '../services/api';

function PostList() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const postData = await postService.getAllPosts(page, 10, category, search);
        setPosts(postData.posts);
        setTotalPages(postData.pages);
        const categoryData = await categoryService.getAllCategories();
        setCategories(categoryData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, category, search]);

  const handleDelete = async (id) => {
    const previousPosts = posts;
    setPosts(posts.filter((post) => post._id !== id));
    try {
      await postService.deletePost(id);
    } catch (err) {
      setPosts(previousPosts);
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Blog Posts</h1>
      <div>
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      {posts.map((post) => (
        <div key={post._id}>
          <h2>{post.title}</h2>
          <p>{post.category.name}</p>
          <Link to={`/posts/${post._id}`}>Read More</Link>
          <button onClick={() => handleDelete(post._id)}>Delete</button>
          <Link to={`/edit/${post._id}`}>Edit</Link>
        </div>
      ))}
      <div>
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i} onClick={() => setPage(i + 1)} disabled={page === i + 1}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PostList;