import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  fetchBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  Blog,
  CreateBlogData,
  UpdateBlogData,
  clearBlogErrors,
} from '../../store/blogs/actions';
import { toast } from 'react-toastify';

const Blogs: React.FC = () => {
  const dispatch = useDispatch();
  const { blogs, loading, error } = useSelector((state: RootState) => state.blogs);
  const { user } = useSelector((state: RootState) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [deletingBlog, setDeletingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    displayImage: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Check if user is admin or superadmin
  const canManageBlogs = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    loadBlogs();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearBlogErrors());
    }
  }, [error, dispatch]);

  const loadBlogs = async () => {
    try {
      const blogsData = await dispatch(fetchBlogs() as any);
      console.log('Blogs loaded:', blogsData);
    } catch (error: any) {
      console.error('Error loading blogs:', error);
      toast.error(error.message || 'Failed to load blogs');
    }
  };

  const handleOpenModal = (blog?: Blog) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title,
        notes: blog.notes,
        displayImage: null,
      });
      setImagePreview(blog.displayImage);
    } else {
      setEditingBlog(null);
      setFormData({
        title: '',
        notes: '',
        displayImage: null,
      });
      setImagePreview(null);
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBlog(null);
    setFormData({
      title: '',
      notes: '',
      displayImage: null,
    });
    setImagePreview(null);
    setFormErrors({});
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors({ ...formErrors, displayImage: 'Image size must be less than 5MB' });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setFormErrors({ ...formErrors, displayImage: 'Only image files are allowed' });
        return;
      }
      setFormData({ ...formData, displayImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setFormErrors({ ...formErrors, displayImage: '' });
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData.notes.trim()) {
      errors.notes = 'Content is required';
    }
    if (!editingBlog && !formData.displayImage) {
      errors.displayImage = 'Display image is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingBlog) {
        const updateData: UpdateBlogData = {
          title: formData.title,
          notes: formData.notes,
        };
        if (formData.displayImage) {
          updateData.displayImage = formData.displayImage;
        }
        await dispatch(updateBlog(editingBlog._id, updateData) as any);
        toast.success('Blog updated successfully');
      } else {
        const createData: CreateBlogData = {
          title: formData.title,
          notes: formData.notes,
          displayImage: formData.displayImage!,
        };
        const newBlog = await dispatch(createBlog(createData) as any);
        console.log('Blog created:', newBlog);
        toast.success('Blog created successfully');
      }
      handleCloseModal();
      // Reload blogs to show the new/updated blog
      setTimeout(() => {
        loadBlogs();
      }, 500);
    } catch (error: any) {
      console.error('Error saving blog:', error);
      toast.error(error.message || 'Failed to save blog');
    }
  };

  const handleDeleteClick = (blog: Blog) => {
    setDeletingBlog(blog);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBlog) return;

    try {
      await dispatch(deleteBlog(deletingBlog._id) as any);
      toast.success('Blog deleted successfully');
      setShowDeleteModal(false);
      setDeletingBlog(null);
      await loadBlogs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete blog');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Blogs Management</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Create and manage blog posts for your website
          </p>
        </div>
        {canManageBlogs && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
          >
            <i className="fas fa-plus"></i>
            Create Blog Post
          </button>
        )}
      </div>

      {loading && blogs.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : blogs.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm dark:bg-slate-900/70">
          <i className="fas fa-blog text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 dark:text-slate-400">No blogs found</p>
          {canManageBlogs && (
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 text-teal-600 hover:text-teal-700 dark:text-teal-400"
            >
              Create your first blog post
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-lg dark:bg-slate-900/70"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={blog.displayImage}
                  alt={blog.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {canManageBlogs && (
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => handleOpenModal(blog)}
                      className="rounded-lg bg-white/90 p-2 text-teal-600 shadow-sm transition hover:bg-white dark:bg-slate-800/90 dark:text-teal-400"
                      title="Edit"
                    >
                      <i className="fas fa-edit text-sm"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(blog)}
                      className="rounded-lg bg-white/90 p-2 text-rose-600 shadow-sm transition hover:bg-white dark:bg-slate-800/90 dark:text-rose-400"
                      title="Delete"
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </button>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2 dark:text-white">
                  {blog.title}
                </h3>
                <p className="mb-4 text-sm text-gray-500 dark:text-slate-400 line-clamp-3">
                  {blog.notes}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-slate-500">
                  <span>
                    <i className="fas fa-calendar mr-1"></i>
                    {formatDate(blog.createdAt)}
                  </span>
                  {blog.images.length > 0 && (
                    <span>
                      <i className="fas fa-images mr-1"></i>
                      {blog.images.length} images
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-slate-900">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingBlog ? 'Edit Blog' : 'Create New Blog'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-300"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    setFormErrors({ ...formErrors, title: '' });
                  }}
                  className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 ${
                    formErrors.title ? 'border-rose-400' : 'border-gray-300'
                  }`}
                  placeholder="Enter blog title"
                />
                {formErrors.title && (
                  <p className="mt-1 text-xs text-rose-500">{formErrors.title}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Display Image <span className="text-rose-500">*</span>
                  {editingBlog && <span className="text-gray-500"> (optional to change)</span>}
                </label>
                <div className="space-y-3">
                  {imagePreview && (
                    <div className="relative h-48 w-full overflow-hidden rounded-lg">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={`w-full rounded-lg border px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 ${
                      formErrors.displayImage ? 'border-rose-400' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.displayImage && (
                    <p className="text-xs text-rose-500">{formErrors.displayImage}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Content <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => {
                    setFormData({ ...formData, notes: e.target.value });
                    setFormErrors({ ...formErrors, notes: '' });
                  }}
                  rows={10}
                  className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 ${
                    formErrors.notes ? 'border-rose-400' : 'border-gray-300'
                  }`}
                  placeholder="Write your blog content here..."
                />
                {formErrors.notes && (
                  <p className="mt-1 text-xs text-rose-500">{formErrors.notes}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-400 dark:bg-teal-500 dark:hover:bg-teal-600"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-circle-notch mr-2 animate-spin"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      {editingBlog ? 'Update' : 'Create'} Blog
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-slate-900">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20">
                  <i className="fas fa-exclamation-triangle text-2xl text-rose-600 dark:text-rose-400"></i>
                </div>
              </div>
              <h3 className="mb-2 text-center text-xl font-semibold text-gray-900 dark:text-white">
                Delete Blog?
              </h3>
              <p className="mb-6 text-center text-gray-600 dark:text-slate-400">
                Are you sure you want to delete "{deletingBlog.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingBlog(null);
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blogs;
