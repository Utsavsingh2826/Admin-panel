import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

// Import reducers
import authReducer from './auth/reducer';

// Persist config
const persistConfig = {
  key: 'jewelry-admin',
  storage,
  whitelist: ['auth'] // Only persist auth state
};

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Redux DevTools extension
const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Create store with thunk middleware
export const store = createStore(
  persistedReducer,
  composeEnhancers(applyMiddleware(thunk))
);

// Persistor
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

