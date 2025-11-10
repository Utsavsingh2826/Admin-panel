import {
  FETCH_USERS_REQUEST,
  FETCH_USERS_SUCCESS,
  FETCH_USERS_FAILURE,
  FETCH_USER_REQUEST,
  FETCH_USER_SUCCESS,
  FETCH_USER_FAILURE,
  CREATE_USER_REQUEST,
  CREATE_USER_SUCCESS,
  CREATE_USER_FAILURE,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAILURE,
  DELETE_USER_REQUEST,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAILURE,
  TOGGLE_USER_STATUS_REQUEST,
  TOGGLE_USER_STATUS_SUCCESS,
  TOGGLE_USER_STATUS_FAILURE,
  UNLOCK_USER_REQUEST,
  UNLOCK_USER_SUCCESS,
  UNLOCK_USER_FAILURE,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAILURE,
  CLEAR_USER_ERRORS,
} from './actionTypes';
import { User } from './actions';

interface UsersState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pages: number;
}

const initialState: UsersState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pages: 1,
};

export const usersReducer = (state = initialState, action: any): UsersState => {
  switch (action.type) {
    case FETCH_USERS_REQUEST:
    case FETCH_USER_REQUEST:
    case CREATE_USER_REQUEST:
    case UPDATE_USER_REQUEST:
    case DELETE_USER_REQUEST:
    case TOGGLE_USER_STATUS_REQUEST:
    case UNLOCK_USER_REQUEST:
    case RESET_PASSWORD_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_USERS_SUCCESS:
      return {
        ...state,
        loading: false,
        users: action.payload.data,
        total: action.payload.total,
        page: action.payload.page,
        pages: action.payload.pages,
        error: null,
      };

    case FETCH_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        currentUser: action.payload,
        error: null,
      };

    case CREATE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        users: [action.payload, ...state.users],
        error: null,
      };

    case UPDATE_USER_SUCCESS:
    case TOGGLE_USER_STATUS_SUCCESS:
    case UNLOCK_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        users: state.users.map((user) =>
          user._id === action.payload._id ? action.payload : user
        ),
        currentUser: state.currentUser?._id === action.payload._id ? action.payload : state.currentUser,
        error: null,
      };

    case DELETE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        users: state.users.filter((user) => user._id !== action.payload),
        error: null,
      };

    case RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };

    case FETCH_USERS_FAILURE:
    case FETCH_USER_FAILURE:
    case CREATE_USER_FAILURE:
    case UPDATE_USER_FAILURE:
    case DELETE_USER_FAILURE:
    case TOGGLE_USER_STATUS_FAILURE:
    case UNLOCK_USER_FAILURE:
    case RESET_PASSWORD_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CLEAR_USER_ERRORS:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

