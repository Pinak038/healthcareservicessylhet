import React from 'react';

const selectedTabStyle = "inline-block px-4 py-3 text-white bg-blue-600 rounded-lg active";
const nonSelectedTabStyle = "inline-block px-4 py-3 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white";

const AmbulanceProviders = ({ ambulanceProviders, selectedProvider, setSelectedProvider }) => {
    const onTabChange = (event, name) => {
        event.preventDefault();
        setSelectedProvider(name);
    }

    return (
        <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400">
            {
                ambulanceProviders.map((provider) => (
                    <li className="me-2">
                        <a
                            href="#"
                            className={provider === selectedProvider ? selectedTabStyle : nonSelectedTabStyle}
                            aria-current="page"
                            onClick={(event) => onTabChange(event, provider)}
                        >
                            {provider}
                        </a>
                    </li>
                ))
            }
        </ul>
    );
};

export default AmbulanceProviders;