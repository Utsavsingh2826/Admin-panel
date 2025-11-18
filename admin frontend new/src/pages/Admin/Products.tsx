import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  fetchProducts,
  fetchCategories,
  deleteProduct,
  Product,
  clearProductErrors,
} from '../../store/products/actions';
import { toast } from 'react-toastify';

const Products: React.FC = () => {
  const dispatch = useDispatch();
  const { products, loading, error, total, page, pages, categories } = useSelector((state: RootState) => state.products);
  const { user } = useSelector((state: RootState) => state.auth);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subCategoryFilter, setSubCategoryFilter] = useState('');
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const canManageProducts = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [currentPage, searchTerm, categoryFilter, subCategoryFilter]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearProductErrors());
    }
  }, [error, dispatch]);

  const loadProducts = async () => {
    try {
      await dispatch(fetchProducts(currentPage, 20, searchTerm, categoryFilter, subCategoryFilter) as any);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load products');
    }
  };

  const loadCategories = async () => {
    try {
      await dispatch(fetchCategories() as any);
    } catch (error: any) {
      // Silently fail - categories are optional
    }
  };

  const toggleProductDetails = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedProduct(null);
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await dispatch(deleteProduct(product._id) as any);
      toast.success('Product deleted successfully');
      await loadProducts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return 'N/A';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
    setSubCategoryFilter(''); // Reset subcategory when category changes
    setCurrentPage(1);
  };

  const handleSubCategoryFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSubCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
            Manage your product catalog ({total} total products)
          </p>
        </div>
        {canManageProducts && (
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
            <i className="fas fa-plus mr-2"></i>
            Add Product
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by title, SKU, description..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={handleCategoryFilter}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Sub Category
            </label>
            <select
              value={subCategoryFilter}
              onChange={handleSubCategoryFilter}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-white"
              disabled={!categoryFilter}
            >
              <option value="">All Sub Categories</option>
              {categories.subCategories
                .filter((subCat) => {
                  // Filter subcategories based on selected category if needed
                  return true;
                })
                .map((subCat) => (
                  <option key={subCat} value={subCat}>
                    {subCat}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <i className="fas fa-circle-notch fa-spin text-3xl text-teal-600"></i>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-12 text-center">
          <i className="fas fa-gem text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 dark:text-slate-400">No products found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-800">
                  <th className="w-[15%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Product
                  </th>
                  <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    SKU
                  </th>
                  <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Category
                  </th>
                  <th className="w-[10%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Price
                  </th>
                  <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Metal
                  </th>
                  <th className="w-[10%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Diamond
                  </th>
                  <th className="w-[10%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Features
                  </th>
                  <th className="w-[19%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {products.map((product) => {
                  const isExpanded = expandedProducts.has(product._id);
                  
                  return (
                    <React.Fragment key={product._id}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleProductDetails(product._id)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} text-xs`}></i>
                            </button>
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {product.images?.main && (
                                <img
                                  src={product.images.main}
                                  alt={product.title}
                                  className="h-12 w-12 rounded-lg object-cover border border-gray-200 dark:border-slate-700 flex-shrink-0"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                  {product.title}
                                </div>
                                {product.description && (
                                  <div className="text-xs text-gray-500 dark:text-slate-400 truncate">
                                    {product.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-mono text-gray-900 dark:text-white">
                            {product.sku}
                          </div>
                          {product.variant && (
                            <div className="text-xs text-gray-500 dark:text-slate-400">
                              {product.variant}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {product.category}
                          </div>
                          {product.subCategory && (
                            <div className="text-xs text-gray-500 dark:text-slate-400">
                              {product.subCategory}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(product.price)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {product.metal ? (
                            <div className="text-sm text-gray-900 dark:text-white">
                              {product.metal}
                              {product.karat && ` ${product.karat}K`}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {product.diamondShape ? (
                            <div className="text-sm text-gray-900 dark:text-white">
                              {product.diamondShape}
                              {product.diamondSize && ` ${product.diamondSize}ct`}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1">
                            {product.isGiftingAvailable && (
                              <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">
                                Gift
                              </span>
                            )}
                            {product.isEngraving && (
                              <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                                Engrave
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(product)}
                              className="px-3 py-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            {canManageProducts && (
                              <>
                                <button
                                  className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                  title="Edit"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  onClick={() => handleDelete(product)}
                                  className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                  title="Delete"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50 dark:bg-slate-800/30">
                          <td colSpan={8} className="px-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                  Product Information
                                </h4>
                                <div className="space-y-1 text-xs">
                                  <div>
                                    <span className="text-gray-500 dark:text-slate-400">Title: </span>
                                    <span className="text-gray-900 dark:text-white">{product.title}</span>
                                  </div>
                                  {product.description && (
                                    <div>
                                      <span className="text-gray-500 dark:text-slate-400">Description: </span>
                                      <span className="text-gray-900 dark:text-white">{product.description}</span>
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-gray-500 dark:text-slate-400">SKU: </span>
                                    <span className="text-gray-900 dark:text-white font-mono">{product.sku}</span>
                                  </div>
                                  {product.variant && (
                                    <div>
                                      <span className="text-gray-500 dark:text-slate-400">Variant: </span>
                                      <span className="text-gray-900 dark:text-white">{product.variant}</span>
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-gray-500 dark:text-slate-400">Price: </span>
                                    <span className="text-gray-900 dark:text-white font-semibold">
                                      {formatCurrency(product.price)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                  Specifications
                                </h4>
                                <div className="space-y-1 text-xs">
                                  <div>
                                    <span className="text-gray-500 dark:text-slate-400">Category: </span>
                                    <span className="text-gray-900 dark:text-white">
                                      {product.category}
                                      {product.subCategory && ` / ${product.subCategory}`}
                                    </span>
                                  </div>
                                  {product.metal && (
                                    <div>
                                      <span className="text-gray-500 dark:text-slate-400">Metal: </span>
                                      <span className="text-gray-900 dark:text-white">
                                        {product.metal}
                                        {product.karat && ` ${product.karat}K`}
                                      </span>
                                    </div>
                                  )}
                                  {product.diamondShape && (
                                    <div>
                                      <span className="text-gray-500 dark:text-slate-400">Diamond: </span>
                                      <span className="text-gray-900 dark:text-white">
                                        {product.diamondShape}
                                        {product.diamondSize && ` ${product.diamondSize}ct`}
                                      </span>
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-gray-500 dark:text-slate-400">Features: </span>
                                    <span className="text-gray-900 dark:text-white">
                                      {product.isGiftingAvailable && 'Gifting '}
                                      {product.isEngraving && 'Engraving'}
                                      {!product.isGiftingAvailable && !product.isEngraving && 'None'}
                                    </span>
                                  </div>
                                  {product.createdAt && (
                                    <div>
                                      <span className="text-gray-500 dark:text-slate-400">Created: </span>
                                      <span className="text-gray-900 dark:text-white">
                                        {formatDate(product.createdAt)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            {product.images?.sub && product.images.sub.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                  Additional Images
                                </h4>
                                <div className="flex gap-2">
                                  {product.images.sub.map((img, idx) => (
                                    <img
                                      key={idx}
                                      src={img}
                                      alt={`${product.title} ${idx + 1}`}
                                      className="h-16 w-16 rounded-lg object-cover border border-gray-200 dark:border-slate-700"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-slate-300">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, total)} of {total} products
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(pages, prev + 1))}
                  disabled={currentPage === pages}
                  className="px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Product Details: {selectedProduct.title}
              </h3>
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Product Images */}
              {selectedProduct.images && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Images</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedProduct.images.main && (
                      <div>
                        <img
                          src={selectedProduct.images.main}
                          alt={selectedProduct.title}
                          className="w-full h-64 rounded-lg object-cover border border-gray-200 dark:border-slate-700"
                        />
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 text-center">Main Image</p>
                      </div>
                    )}
                    {selectedProduct.images.sub && selectedProduct.images.sub.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProduct.images.sub.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`${selectedProduct.title} ${idx + 1}`}
                            className="w-full h-32 rounded-lg object-cover border border-gray-200 dark:border-slate-700"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Product Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-slate-400">Title: </span>
                      <span className="text-gray-900 dark:text-white font-semibold">{selectedProduct.title}</span>
                    </div>
                    {selectedProduct.description && (
                      <div>
                        <span className="text-gray-500 dark:text-slate-400">Description: </span>
                        <span className="text-gray-900 dark:text-white">{selectedProduct.description}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500 dark:text-slate-400">SKU: </span>
                      <span className="text-gray-900 dark:text-white font-mono">{selectedProduct.sku}</span>
                    </div>
                    {selectedProduct.variant && (
                      <div>
                        <span className="text-gray-500 dark:text-slate-400">Variant: </span>
                        <span className="text-gray-900 dark:text-white">{selectedProduct.variant}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500 dark:text-slate-400">Price: </span>
                      <span className="text-gray-900 dark:text-white font-bold text-lg">
                        {formatCurrency(selectedProduct.price)}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Specifications</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-slate-400">Category: </span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedProduct.category}
                        {selectedProduct.subCategory && ` / ${selectedProduct.subCategory}`}
                      </span>
                    </div>
                    {selectedProduct.metal && (
                      <div>
                        <span className="text-gray-500 dark:text-slate-400">Metal: </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedProduct.metal}
                          {selectedProduct.karat && ` ${selectedProduct.karat}K`}
                        </span>
                      </div>
                    )}
                    {selectedProduct.diamondShape && (
                      <div>
                        <span className="text-gray-500 dark:text-slate-400">Diamond: </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedProduct.diamondShape}
                          {selectedProduct.diamondSize && ` ${selectedProduct.diamondSize}ct`}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500 dark:text-slate-400">Gifting Available: </span>
                      <span className={selectedProduct.isGiftingAvailable ? 'text-emerald-600' : 'text-gray-600'}>
                        {selectedProduct.isGiftingAvailable ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-slate-400">Engraving Available: </span>
                      <span className={selectedProduct.isEngraving ? 'text-emerald-600' : 'text-gray-600'}>
                        {selectedProduct.isEngraving ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {selectedProduct.createdAt && (
                      <div>
                        <span className="text-gray-500 dark:text-slate-400">Created: </span>
                        <span className="text-gray-900 dark:text-white">{formatDate(selectedProduct.createdAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
