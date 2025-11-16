import {
  FETCH_BLOGS_REQUEST,
  FETCH_BLOGS_SUCCESS,
  FETCH_BLOGS_FAILURE,
  FETCH_BLOG_REQUEST,
  FETCH_BLOG_SUCCESS,
  FETCH_BLOG_FAILURE,
  CREATE_BLOG_REQUEST,
  CREATE_BLOG_SUCCESS,
  CREATE_BLOG_FAILURE,
  UPDATE_BLOG_REQUEST,
  UPDATE_BLOG_SUCCESS,
  UPDATE_BLOG_FAILURE,
  DELETE_BLOG_REQUEST,
  DELETE_BLOG_SUCCESS,
  DELETE_BLOG_FAILURE,
  CLEAR_BLOG_ERRORS,
} from './actionTypes';
import api from '../../utils/api';

export interface BlogImage {
  url: string;
  publicId: string;
}

export interface Blog {
  _id: string;
  title: string;
  displayImage: string;
  displayImagePublicId: string;
  notes: string;
  images: BlogImage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogData {
  title: string;
  notes: string;
  displayImage: File;
}

export interface UpdateBlogData {
  title?: string;
  notes?: string;
  displayImage?: File;
}

export const fetchBlogs = () => async (dispatch: any) => {
  dispatch({ type: FETCH_BLOGS_REQUEST });

  try {
    const response = await api.get('/blogs');
    dispatch({
      type: FETCH_BLOGS_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch blogs';
    dispatch({
      type: FETCH_BLOGS_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

export const fetchBlog = (id: string) => async (dispatch: any) => {
  dispatch({ type: FETCH_BLOG_REQUEST });

  try {
    const response = await api.get(`/blogs/${id}`);
    dispatch({
      type: FETCH_BLOG_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch blog';
    dispatch({
      type: FETCH_BLOG_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

export const createBlog = (blogData: CreateBlogData) => async (dispatch: any) => {
  dispatch({ type: CREATE_BLOG_REQUEST });

  try {
    const formData = new FormData();
    formData.append('title', blogData.title);
    formData.append('notes', blogData.notes);
    formData.append('displayImage', blogData.displayImage);

    const response = await api.post('/blogs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    dispatch({
      type: CREATE_BLOG_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to create blog';
    dispatch({
      type: CREATE_BLOG_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

export const updateBlog = (id: string, blogData: UpdateBlogData) => async (dispatch: any) => {
  dispatch({ type: UPDATE_BLOG_REQUEST });

  try {
    const formData = new FormData();
    if (blogData.title) formData.append('title', blogData.title);
    if (blogData.notes) formData.append('notes', blogData.notes);
    if (blogData.displayImage) formData.append('displayImage', blogData.displayImage);

    const response = await api.put(`/blogs/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    dispatch({
      type: UPDATE_BLOG_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to update blog';
    dispatch({
      type: UPDATE_BLOG_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

export const deleteBlog = (id: string) => async (dispatch: any) => {
  dispatch({ type: DELETE_BLOG_REQUEST });

  try {
    await api.delete(`/blogs/${id}`);
    dispatch({
      type: DELETE_BLOG_SUCCESS,
      payload: id,
    });
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to delete blog';
    dispatch({
      type: DELETE_BLOG_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

export const clearBlogErrors = () => ({
  type: CLEAR_BLOG_ERRORS,
});

