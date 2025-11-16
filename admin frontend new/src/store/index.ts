import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

// Import reducers
import authReducer from './auth/reducer';
import { usersReducer } from './users/reducer';
import { promoCodesReducer } from './promocodes/reducer';
import { metalPricesReducer } from './metalPrices/reducer';
import { blogsReducer } from './blogs/reducer';
import { customizationRequestsReducer } from './customizationRequests/reducer';
import { ordersReducer } from './orders/reducer';

// Persist config
const persistConfig = {
  key: 'jewelry-admin',
  storage,
  whitelist: ['auth'] // Only persist auth state
};

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
  promoCodes: promoCodesReducer,
  metalPrices: metalPricesReducer,
  blogs: blogsReducer,
  customizationRequests: customizationRequestsReducer,
  orders: ordersReducer,
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

