import { format } from 'date-fns';
import React, { useContext } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../../Contexts/AuthProvider';

const BookingModal = ({ item, setItem, refetch }) => {

    const { name: itemName, stock, price, } = item;
    const date = format(Date.now(), 'PP');
    const {user} = useContext(AuthContext);





    const handleBooking = event => {
        event.preventDefault();
        const form = event.target;
        const count = form.count.value;
        const name = form.name.value;
        const email = form.email.value;
        const phone = form.phone.value;
        const address = form.address.value;
        // [3, 4, 5].map((value, i) => console.log(value))
        const order = {
            orderDate: date,
            item: itemName,
            name,
            count,
            price: parseInt(price) * parseInt(count),
            email,
            phone,
            address,
        }

        // TODO: send data to the server
        // and once data is saved then close the modal 
        // and display success toast
        // console.log(booking);


        fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/orders`, {
            method: 'POST',
            headers:{
                'content-type':'application/json',
                authorization: `bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify(order)
        })
        .then(res => res.json())
        .then(data =>{
            console.log(data);
           if(data.url){
            window.location.replace(data.url);
           }
           else{
            toast.error(data.message)
           }
        })

        
    }


    return (
        <>
        <input type="checkbox" id="booking-modal" className="modal-toggle" />
        <div className="modal">
            <div className="modal-box relative">
                <label htmlFor="booking-modal" className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
                <h3 className="text-lg font-bold">{itemName}</h3>
                <form onSubmit={handleBooking} className='grid grid-cols-1 gap-3 mt-10'>
                    <input type="text" disabled value={date} className="input w-full input-bordered " />
                    <input name="count" type="number" max={stock} placeholder='No of item' className="input w-full input-bordered" />
                    <input name="name" type="text" placeholder="Your Name" defaultValue={user?.displayName} disabled className="input w-full input-bordered" />
                    <input name="email" type="email" defaultValue={user?.email} disabled placeholder="Email Address" className="input w-full input-bordered" />
                    <input name="address" type="text" placeholder="Address" className="input w-full input-bordered" />
                    <input name="phone" type="text" placeholder="Phone Number" className="input w-full input-bordered" />
                    <br />
                    <input className='btn btn-accent w-full' type="submit" value="Checkout" />
                </form>
            </div>
        </div>
    </>
);
   
};

export default BookingModal;