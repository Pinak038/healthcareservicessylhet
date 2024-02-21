import React, { useState } from 'react';
import AppointmentBanner from '../AppointmentBanner/AppointmentBanner';
import AvailableDoctors from '../AvailableDoctors/AvailableDoctors';
import AppointmentSpecialty from '../AppointmentSpecialty/AppointmentSpecialty';

const Appoitment = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSpecialty, setSelectedSpecialty] = useState('Teeth Orthodontics');
    return (
        <div>
            <AppointmentBanner
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
            ></AppointmentBanner>

            <AppointmentSpecialty
                selectedDate={selectedDate}
                selectedSpecialty={selectedSpecialty}
                setSelectedSpecialty={setSelectedSpecialty}
            />

            <AvailableDoctors
                selectedDate={selectedDate}
                selectedSpecialty={selectedSpecialty}
            ></AvailableDoctors>

        </div>
    );
};

export default Appoitment;