import React, { useContext } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { AuthContext } from '../Contexts/AuthProvider';
import useAdmin from '../hooks/useAdmin';
import NavBar from '../Pages/Shared/NavBar/Navbar'
import useDoctor from '../hooks/useDoctor';

const DashboardLayout = () => {
    const { user } = useContext(AuthContext);
    const [isAdmin] = useAdmin(user?.email)
    const [isDoctor, isApproved] = useDoctor(user?.email)
    return (
        <div>
            <NavBar></NavBar>
            <div className="drawer drawer-mobile">
                <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content">
                    <Outlet></Outlet>
                </div>
                <div className="drawer-side">
                    <label htmlFor="dashboard-drawer" className="drawer-overlay"></label>
                    <ul className="menu p-4 w-80  text-base-content">
                        <li><Link to="/dashboard">My Profile</Link></li>
                        {((isDoctor && isApproved) || !isDoctor) && (<>
                            <li><Link to="/dashboard/myappointments">My Appointments</Link></li>
                            <li><Link to="/dashboard/order">My Orders</Link></li>
                        </>)}
                        {/* <li><Link to="/dashboard/allusers">All users</Link></li> */}
                        {
                            isAdmin && <>
                                <li><Link to="/dashboard/allusers">All users</Link></li>
                                {/* <li><Link to="/dashboard/adddoctor">Add a doctors</Link></li> */}
                                <li><Link to="/dashboard/managedoctors">Manage doctors</Link></li>
                                <li><Link to="/dashboard/additem">Add Item</Link></li>
                                <li><Link to="/dashboard/manageitems">Manage Items</Link></li>
                            </>
                        }

                    </ul>

                </div>
            </div>
        </div>
       
    );
};

export default DashboardLayout;