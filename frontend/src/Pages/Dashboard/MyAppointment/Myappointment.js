import { useQuery } from '@tanstack/react-query';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../Contexts/AuthProvider';
import useDoctor from '../../../hooks/useDoctor';

const Myappointment = () => {
    const { user } = useContext(AuthContext);
    const [isDoctor, isApproved, doctorDetails, isDoctorLoading] = useDoctor(user?.email);


    const { data: bookings = [] } = useQuery({
        queryKey: ['bookings', user?.email, isDoctor, isDoctorLoading],
        queryFn: async () => {
            if (isDoctorLoading) {
                return [];
            }
            let url = `${process.env.REACT_APP_SERVER_DOMAIN}/bookings`;
            if (isDoctor) {
                url += `?doctor=${doctorDetails.name}`;
            }
            else {
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
            <h3 className="text-3xl mb-5">My Appointments</h3>
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            <th>Doctor</th>
                            <th>Date</th>
                            <th>Time</th>
                            {!isDoctor && (<th>Status</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {
                            bookings &&
                            bookings?.map((booking, i) => <tr key={booking._id}>
                                <th>{i + 1}</th>
                                <td>{booking.patient}</td>
                                <td>{booking.doctor}</td>
                                <td>{booking.appointmentDate}</td>
                                <td>{booking.slot}</td>
                                {!isDoctor && (
                                    <td>{booking.paymentStatus}</td>
                                )}
                            </tr>)
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Myappointment;