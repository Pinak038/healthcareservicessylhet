import React, { useContext } from 'react';
import { AuthContext } from '../../../Contexts/AuthProvider';

const ItemCard = ({ item, setItem }) => {
    const { name, stock, price, image } = item;
    const { user } = useContext(AuthContext);
    return (
        <div className="card shadow-xl">
            <div className="card-body text-center items-center">
                <div className="avatar">
                    <div className="w-24 rounded-full">
                        <img src={image} alt="" />
                    </div>
                </div>
                <h2 className="text-2xl text-secondary font-bold text-center">{name}</h2>
                <p>{stock} {stock > 1 ? 'items' : 'item'} available</p>
                <p>Price: ${price}</p>
                <div className="card-actions justify-center">
                    <label
                        disabled={stock === 0 || !user || !user?.emailVerified}
                        htmlFor="booking-modal"
                        className="btn btn-primary text-white"
                        onClick={() => setItem(item)}
                    >Buy</label>
                </div>
            </div>
        </div>
    );
};

export default ItemCard;