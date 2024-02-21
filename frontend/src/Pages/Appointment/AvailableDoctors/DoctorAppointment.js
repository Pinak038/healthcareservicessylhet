import React, { useContext } from 'react';
import { AuthContext } from '../../../Contexts/AuthProvider';
import useDoctor from '../../../hooks/useDoctor';

const DoctorAppointment = ({ doctorDetails, setSelectedDoctor }) => {
    const { name, slots, price, image } = doctorDetails;
    const { user } = useContext(AuthContext);
    const [isDoctor] = useDoctor(user?.email);
    return (
        <div className="card shadow-xl">
            <div className="card-body text-center items-center">
                <div className="avatar">
                    <div className="w-24 rounded-full">
                        <img src={image} alt="" />
                    </div>
                </div>
                <h2 className="text-2xl text-secondary font-bold text-center">{name}</h2>
                <p>{slots.length > 0 ? slots[0] : 'Try Another day'}</p>
                <p>{slots.length} {slots.length > 1 ? 'spaces' : 'space'} available</p>
                <p>Price: ${price}</p>
                <div className="card-actions justify-center">
                    <label
                        disabled={slots.length === 0 || !user || !user?.emailVerified || isDoctor}
                        htmlFor="booking-modal"
                        className="btn btn-primary text-white"
                        onClick={() => setSelectedDoctor(doctorDetails)}
                    >Book Appointment</label>
                </div>
            </div>
        </div>
    );
};

export default DoctorAppointment;