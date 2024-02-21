import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Loading from '../../Shared/Loading/Loading';

const selectedTabStyle = "inline-block px-4 py-3 text-white bg-blue-600 rounded-lg active";
const nonSelectedTabStyle = "inline-block px-4 py-3 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white";

const AccessoriesCategories = ({ selectedCategory, setSelectedCategory }) => {
    const { data:categories = [], refetch, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: () => fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/itemCategories`)
            .then(res => res.json())
    })

    const onTabChange = (event, name) => {
        event.preventDefault();
        setSelectedCategory(name);
    }

    if (isLoading) {
        return <Loading></Loading>
    }

    return (
        <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400">
            {
                categories.map((category) => (
                    <li className="me-2">
                        <a
                            href="#"
                            className={category.name === selectedCategory ? selectedTabStyle : nonSelectedTabStyle}
                            aria-current="page"
                            onClick={(event) => onTabChange(event, category.name)}
                        >
                            {category.displayName}
                        </a>
                    </li>
                ))
            }
        </ul>
    );
};

export default AccessoriesCategories;