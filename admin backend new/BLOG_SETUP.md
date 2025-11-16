# Blog Functionality Setup

## Required Packages

Install the following packages in the backend:

```bash
cd "admin backend new"
npm install cloudinary multer multer-storage-cloudinary
npm install --save-dev @types/multer
```

## Environment Variables

Add these to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Features Implemented

### Backend
- ✅ Blog model with schema (title, displayImage, notes, images)
- ✅ Cloudinary configuration for image uploads
- ✅ Multer middleware for handling file uploads
- ✅ Blog controller with CRUD operations:
  - GET /api/blogs - Get all blogs
  - GET /api/blogs/:id - Get blog by ID
  - POST /api/blogs - Create blog (Admin/Superadmin only)
  - PUT /api/blogs/:id - Update blog (Admin/Superadmin only)
  - DELETE /api/blogs/:id - Delete blog (Admin/Superadmin only)
  - POST /api/blogs/:id/images - Add images to blog
  - DELETE /api/blogs/:id/images/:publicId - Delete image from blog
- ✅ Blog routes with authentication and authorization
- ✅ Image deletion from Cloudinary when blog/images are deleted

### Frontend
- ✅ Redux store for blogs (actions, reducer, actionTypes)
- ✅ Blog management page with:
  - List of all blogs with images
  - Create new blog form
  - Edit blog form
  - Delete blog with confirmation
  - Image upload with preview
  - Form validation
  - Role-based access (Admin/Superadmin only)

## Usage

1. **Install packages** (see above)
2. **Configure Cloudinary** in `.env` file
3. **Start backend**: `npm run dev`
4. **Access blogs page**: Navigate to `/blogs` in the sidebar
5. **Create blog**: Click "Create Blog Post" button (Admin/Superadmin only)
6. **Edit blog**: Click edit icon on any blog card
7. **Delete blog**: Click delete icon on any blog card

## API Endpoints

- `GET /api/blogs` - Public, get all blogs
- `GET /api/blogs/:id` - Public, get blog by ID
- `POST /api/blogs` - Protected (Admin/Superadmin), create blog
- `PUT /api/blogs/:id` - Protected (Admin/Superadmin), update blog
- `DELETE /api/blogs/:id` - Protected (Admin/Superadmin), delete blog

## Notes

- Display image is required when creating a blog
- Display image is optional when updating (only if you want to change it)
- Images are automatically optimized by Cloudinary
- Maximum file size: 5MB per image
- Maximum 10 additional images per blog

