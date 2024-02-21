import DashboardLayout from "../../Layout/DashboardLayout";
import Ambulance from "../../Pages/Ambulance/Ambulance/Ambulance";
import Appoitment from "../../Pages/Appointment/Appointment/Appoitment";
import AddDoctor from "../../Pages/Dashboard/AddDoctor/AddDoctor";
import AllUsers from "../../Pages/Dashboard/AllUsers/AllUsers";
import Dashboard from "../../Pages/Dashboard/Dashboard/Dashboard";
import ManagedDoctor from "../../Pages/Dashboard/ManagedDoctors/ManagedDoctor";
import Myappointment from "../../Pages/Dashboard/MyAppointment/Myappointment";
import MyProfile from "../../Pages/Dashboard/MyProfile/MyProfile";
import Payment from "../../Pages/Dashboard/Payment/Payment";
import Login from "../../Pages/Login/Login";
import DisplayError from "../../Pages/Shared/DisplayError/DisplayError";
import Signup from "../../Pages/Signup/Signup";
import AdminRoutes from "../AdminRoutes/AdminRoutes";
import Privateroute from "../PrivateRoutes/Privateroute";
import AddItem from "../../Pages/Dashboard/AddItem/AddItem";
import ManageItem from "../../Pages/Dashboard/ManageItem/ManageItem";
import Accessories from "../../Pages/Accessories/Accessories/Accessories";
import Orders from "../../Pages/Dashboard/Orders/Orders";
import About from "../../Pages/About/About";

const { createBrowserRouter } = require("react-router-dom");
const { default: Main } = require("../../Layout/Main");
const { default: Home } = require("../../Pages/Home/Home/Home");




 const router = createBrowserRouter([

{
    path: '/',
    element:<Main></Main>,
    errorElement:<DisplayError></DisplayError>,
    children:[
        {
            path:'/',
            element:<Home></Home>
        },
        {
            path:'/login',
            element:<Login></Login>
        },
        {
            path:'/signup',
            element:<Signup></Signup>
        },
        {
            path:'/appointment',
            element:<Appoitment></Appoitment>
        },
        {
            path:'/ambulance-service',
            element: <Ambulance />
        },
        {
            path:'/accessories',
            element: <Accessories />
        },
        {
            path:'/about',
            element: <About />
        },
    ]
        },
        {
            path:'/dashboard',
            element:<Privateroute><DashboardLayout></DashboardLayout></Privateroute>,
            errorElement:<DisplayError></DisplayError>,
            children:[
                {
                    path:'/dashboard',
                    element: <MyProfile />
                },
                {
                    path:'/dashboard/myappointments',
                    element:<Myappointment></Myappointment>
                },
                {
                    path:'/dashboard/allusers',
                    element:<AdminRoutes><AllUsers></AllUsers></AdminRoutes>
                }
                ,
                {
                    path:'/dashboard/adddoctor',
                    element:<AdminRoutes><AddDoctor></AddDoctor></AdminRoutes>
                }
                ,
                {
                    path:'/dashboard/managedoctors',
                    element:<AdminRoutes><ManagedDoctor></ManagedDoctor></AdminRoutes>
                },
                ,
                {
                    path:'/dashboard/payment/:id',
                    element:<Payment></Payment>,
                    loader:({params}) => fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/bookings/${params.id}`)
                },
                {
                    path:'/dashboard/additem',
                    element:<AdminRoutes><AddItem></AddItem></AdminRoutes>
                },
                {
                    path:'/dashboard/manageitems',
                    element:<AdminRoutes><ManageItem></ManageItem></AdminRoutes>
                },
                {
                    path:'/dashboard/order',
                    element:<Orders></Orders>
                }
            ]
        }

])



export  default router;