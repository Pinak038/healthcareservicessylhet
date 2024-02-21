import { useQuery } from '@tanstack/react-query';
import React, { useContext } from 'react';
import { AuthContext } from '../../../Contexts/AuthProvider';
import useAdmin from '../../../hooks/useAdmin';

const Orders = () => {
    const { user } = useContext(AuthContext);
    const [isAdmin, isAdminLoading] = useAdmin(user?.email);

    const { data: orders = [] } = useQuery({
        queryKey: ['orders', user?.email, isAdmin, isAdminLoading],
        queryFn: async () => {
            if (isAdminLoading) {
                return [];
            }
            let url = `${process.env.REACT_APP_SERVER_DOMAIN}/orders`;
            if (!isAdmin) {
                url += `?email=${user?.email}`;
            }
            const res = await fetch(url, {
                headers: {
                    authorization: `bearer ${localStorage.getItem('accessToken')}`
                }
            });
            const data = await res.json();
            return data;
        }
    })

    return (
        <div>
            <h3 className="text-3xl mb-5">My Orders</h3>
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Item</th>
                            <th>Customer</th>
                            <th>Email</th>
                            <th>Address</th>
                            <th>Count</th>
                            <th>Price</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            orders &&
                            orders?.map((order, i) => <tr key={order._id}>
                                <th>{i + 1}</th>
                                <td>{order.item}</td>
                                <td>{order.name}</td>
                                <td>{order.email}</td>
                                <td>{order.address}</td>
                                <td>{order.count}</td>
                                <td>{order.price}</td>
                                <td>{order.orderDate}</td>
                                <td>{order.paymentStatus}</td>
                            </tr>)
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Orders;