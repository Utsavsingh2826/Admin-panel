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
import { Blog } from './actions';

interface BlogsState {
  blogs: Blog[];
  currentBlog: Blog | null;
  loading: boolean;
  error: string | null;
}

const initialState: BlogsState = {
  blogs: [],
  currentBlog: null,
  loading: false,
  error: null,
};

export const blogsReducer = (state = initialState, action: any): BlogsState => {
  switch (action.type) {
    case FETCH_BLOGS_REQUEST:
    case FETCH_BLOG_REQUEST:
    case CREATE_BLOG_REQUEST:
    case UPDATE_BLOG_REQUEST:
    case DELETE_BLOG_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_BLOGS_SUCCESS:
      return {
        ...state,
        loading: false,
        blogs: action.payload,
        error: null,
      };

    case FETCH_BLOG_SUCCESS:
      return {
        ...state,
        loading: false,
        currentBlog: action.payload,
        error: null,
      };

    case CREATE_BLOG_SUCCESS:
      return {
        ...state,
        loading: false,
        blogs: [action.payload, ...state.blogs],
        error: null,
      };

    case UPDATE_BLOG_SUCCESS:
      return {
        ...state,
        loading: false,
        blogs: state.blogs.map((blog) =>
          blog._id === action.payload._id ? action.payload : blog
        ),
        currentBlog: state.currentBlog?._id === action.payload._id ? action.payload : state.currentBlog,
        error: null,
      };

    case DELETE_BLOG_SUCCESS:
      return {
        ...state,
        loading: false,
        blogs: state.blogs.filter((blog) => blog._id !== action.payload),
        currentBlog: state.currentBlog?._id === action.payload ? null : state.currentBlog,
        error: null,
      };

    case FETCH_BLOGS_FAILURE:
    case FETCH_BLOG_FAILURE:
    case CREATE_BLOG_FAILURE:
    case UPDATE_BLOG_FAILURE:
    case DELETE_BLOG_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CLEAR_BLOG_ERRORS:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

