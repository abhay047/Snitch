import { createBrowserRouter } from "react-router";
import Register from "../features/auth/pages/Register.jsx";
import Login from "../features/auth/pages/Login.jsx";
import CreateProduct from "../features/products/pages/CreateProduct.jsx";
import Dashboard from "../features/products/pages/Dashboard.jsx";
import Protected from "../features/auth/components/Protected.jsx";
import Home from "../features/products/pages/Home.jsx";
import ProductDetail from "../features/products/pages/ProductDetail.jsx";
import SellerProductDetails from "../features/products/pages/SellerProductDetails.jsx";
import Cart from "../features/cart/pages/Cart.jsx";
import ShippingAndDelivery from "../features/Shared/CustomerSupport/ShippingAndDelivery.jsx";
import ReturnAndRefund from "../features/Shared/CustomerSupport/ReturnAndRefund.jsx";
import Exchange from "../features/Shared/CustomerSupport/Exchange.jsx";
import Cancellation from "../features/Shared/CustomerSupport/Cancellation.jsx";
import UserPrivacy from "../features/Shared/Legal/UserPrivacy.jsx"
import TermAndConditions from "../features/Shared/Legal/TermAndConditions.jsx";
import Payment from "../features/Shared/Shopping/Payment.jsx";
import NotFound from "../features/Shared/pages/NotFound.jsx";

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <Home/>
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path:"/product/:productId",
        element:<ProductDetail/>
    },
    {
        path:"/cart",
        element:<Protected>
            <Cart/>
        </Protected>
    },
    {
        path: "/seller",
        children: [
            {
                path: "/seller/create-product",
                element: <Protected role="seller">
                    <CreateProduct />
                </Protected>
            },
            {
                path: "/seller/dashboard",
                element: <Protected role="seller">
                    <Dashboard />
                </Protected>
            },
            {
                path:"/seller/product/:productId",
                element:<Protected role="seller">
                    <SellerProductDetails/>
                </Protected>
            }
        ]
    },
    {
        path:"/policy",
        children:[
            {
                path:"/policy/shipping&delivery",
                element:<ShippingAndDelivery/>
            },
            {
                path:"/policy/return&refund",
                element:<ReturnAndRefund/>
            },
            {
                path:"/policy/exchange",
                element:<Exchange/>
            },
            {
                path:"/policy/Cancellation",
                element:<Cancellation/>
            },
            {
                path:"/policy/privacy",
                element:<UserPrivacy/>
            },
            {
                path:"/policy/term&conditions",
                element:<TermAndConditions/>
            },
            {
                path:"/policy/payment",
                element:<Payment/>
            }
        ]
    },
    {
        path: "*",
        element: <NotFound />
    }
])
