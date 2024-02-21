import React from 'react';
import { useQuery } from '@tanstack/react-query';

const selectedTabStyle = "inline-block px-4 py-3 text-white bg-blue-600 rounded-lg active";
const nonSelectedTabStyle = "inline-block px-4 py-3 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white";

const AppointmentSpecialty = ({ selectedSpecialty, setSelectedSpecialty }) => {
    const { data:specialties = [], refetch, isLoading } = useQuery({
        queryKey: ['specialties'],
        queryFn: () => fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/specialties`)
            .then(res => res.json())
    })

    const onTabChange = (event, name) => {
        event.preventDefault();
        setSelectedSpecialty(name);
    }

    return (
        <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400">
            {
                specialties.map((specialty) => (
                    <li className="me-2">
                        <a
                            href="#"
                            className={specialty.name === selectedSpecialty ? selectedTabStyle : nonSelectedTabStyle}
                            aria-current="page"
                            onClick={(event) => onTabChange(event, specialty.name)}
                        >
                            {specialty.name}
                        </a>
                    </li>
                ))
            }
        </ul>
    );
};

export default AppointmentSpecialty;