import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import React, { useState } from 'react';
import Loading from '../../Shared/Loading/Loading';
import BookingModal from '../BookingModal/BookingModal';
import ItemCard from './ItemCard';

const AvailableItems = ({ selectedCategory }) => {

    const [item, setItem] = useState(null);

    const { data: items = [], refetch, isLoading } = useQuery({
        queryKey: ['items', selectedCategory],
        queryFn: () => fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/items?category=${selectedCategory}`)
            .then(res => res.json())
    })

    if (isLoading) {
        return <Loading></Loading>
    }


    return (
        <section className='my-16'>
            <p className='text-center text-secondary font-bold'>Available items</p>
            <div className='grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6'>
                {
                    items.map(option => <ItemCard
                        key={option._id}
                        item={option}
                        setItem={setItem}
                    ></ItemCard>)
                }
            </div>


            {
                item &&
                <BookingModal
                    item={item}
                    setItem={setItem}
                    refetch={refetch}
                ></BookingModal>
            }

        </section>
    );
};

export default AvailableItems;