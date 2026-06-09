# ShopFlow — Full-Stack eCommerce App

A complete eCommerce web application built with React, Node.js/Express, and MongoDB.

## Tech Stack

- **Frontend**: React.js, React Router v6, Axios, react-hot-toast, Lucide React
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Deployment**: Render (backend) + Vercel (frontend)

---

## Project Structure

```
ecommerce-fullstack-design/
├── frontend/                  # React app
│   └── src/
│       ├── components/        # Navbar, Footer, ProductCard
│       ├── context/           # AuthContext, CartContext
│       └── pages/             # Home, Products, ProductDetail, Cart, Login, Register, Admin
├── backend/                   # Express API
│   ├── models/                # Product.js, User.js
│   ├── routes/                # products.js, auth.js, cart.js
│   └── middleware/            # auth.js (JWT)
└── README.md
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas cloud free tier)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/ecommerce-fullstack-design.git
cd ecommerce-fullstack-design
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

> **MongoDB Atlas**: Replace `MONGO_URI` with your Atlas connection string:
> `mongodb+srv://username:password@cluster.mongodb.net/ecommerce`

Start backend:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `.env` in `frontend/`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start frontend:

```bash
npm start
```

App runs at **http://localhost:3000**

---

## Seed Sample Data

Once backend is running, visit these endpoints (or use Postman/curl):

**Seed 12 sample products:**
```
POST http://localhost:5000/api/products/seed/data
```

**Create admin account:**
```
POST http://localhost:5000/api/auth/seed-admin
```
This creates: `admin@store.com` / `admin123`

> In the app, click **"Seed Admin"** and **"Seed Products"** buttons on the Admin page — no Postman needed.

---

## Features

### Customer Side
- **Home Page**: Hero banner, category grid, featured products, promo section
- **Product Listing**: Search, filter by category, price range, sort, pagination
- **Product Detail**: Image gallery, add to cart, related products
- **Cart**: Add/remove/update quantities, order summary, free shipping threshold
- **Auth**: JWT-based login/register with form validation

### Admin Panel (`/admin` — requires admin role)
- Dashboard stats (total products, featured, out of stock)
- Full CRUD — create, edit, delete products
- Seed sample data from the UI
- Protected route (admin only)

### Technical
- Responsive design — desktop & mobile
- Guest cart persisted to localStorage
- Logged-in cart synced to MongoDB
- Protected admin routes (frontend + backend)
- JWT stored in localStorage with axios interceptor

---

## API Endpoints

### Products
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/products` | List all (search, filter, paginate) |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |
| POST | `/api/products/seed/data` | Seed sample products |

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/seed-admin` | Create admin user |

### Cart
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart` | Add item |
| PUT | `/api/cart/:productId` | Update quantity |
| DELETE | `/api/cart/:productId` | Remove item |
| DELETE | `/api/cart` | Clear cart |

---

## Deployment

### Backend → Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo, set root directory to `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables:
   - `MONGO_URI` = your Atlas URI
   - `JWT_SECRET` = a strong secret
   - `CLIENT_URL` = your Vercel frontend URL
   - `NODE_ENV` = production

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Connect your repo, set root directory to `frontend`
3. Add environment variable:
   - `REACT_APP_API_URL` = your Render backend URL + `/api`
4. Deploy

---

## GitHub Repository

```
https://github.com/YOUR_USERNAME/ecommerce-fullstack-design
```

---

## License
MIT
