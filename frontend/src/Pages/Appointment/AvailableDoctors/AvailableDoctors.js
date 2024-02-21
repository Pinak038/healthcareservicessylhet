import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import React, { useState } from 'react';
import Loading from '../../Shared/Loading/Loading';
import BookingModal from '../BookingModal/BookingModal';
import DoctorAppointment from './DoctorAppointment';

const AvailableDoctors = ({ selectedDate, selectedSpecialty }) => {
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    const date = format(selectedDate, 'PP')
    
    const { data: doctors = [], refetch, isLoading } = useQuery({
        queryKey: ['doctors', selectedSpecialty],
        queryFn: () => fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/doctors?specialty=${selectedSpecialty}&date=${date}`)
            .then(res => res.json())
    })

    if (isLoading) {
        return <Loading></Loading>
    }


    return (
        <section className='my-16'>
            <p className='text-center text-secondary font-bold'>Available Doctors on {date}</p>
            <div className='grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6'>
                {
                    doctors.map(doctor => <DoctorAppointment
                        key={doctor._id}
                        doctorDetails={doctor}
                        setSelectedDoctor={setSelectedDoctor}
                    ></DoctorAppointment>)
                }
            </div>


            {
                selectedDoctor &&
                <BookingModal
                    selectedDate={selectedDate}
                    selectedDoctor={selectedDoctor}
                    setSelectedDoctor={setSelectedDoctor}
                    refetch={refetch}
                ></BookingModal>
            }

        </section>
    );
};

export default AvailableDoctors;