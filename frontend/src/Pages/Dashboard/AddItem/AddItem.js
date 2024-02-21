import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Loading from '../../Shared/Loading/Loading';

const AddItem = () => {


    const { register, handleSubmit, formState: { errors } } = useForm();
    
    const imageHostKey = process.env.REACT_APP_imgbb_key;
    console.log(imageHostKey);
    const navigate = useNavigate();
    
    const { data: specialties, isLoading } = useQuery({
        queryKey: ['specialty'],
        queryFn: async () => {
            const res = await fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/itemCategories`);
            const data = await res.json();
            return data;
        }
    })

    const handleAddDoctor = data => {
        console.log(data);
        const image = data.image[0];
        const formData = new FormData();
        formData.append('image', image);
        const url = `https://api.imgbb.com/1/upload?key=${imageHostKey}`
        fetch(url, {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(imgData => { console.log(imgData);
            if(imgData.success){
                console.log(imgData.data.url);
                const item = {
                    name: data.name, 
                    stock: data.stock,
                    price: data.price,
                    category: data.specialty,
                    image: imgData.data.url
                }

                 // save doctor information to the database
                 fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/items`, {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json', 
                        authorization: `bearer ${localStorage.getItem('accessToken')}`
                    },
                    body: JSON.stringify(item)
                })
                .then(res => res.json())
                .then(result =>{
                    console.log(result);
                    toast.success(`${data.name} is added successfully`);
                    navigate('/dashboard/manageitems')
                })
            }
        })
    }

    if(isLoading){
        return <Loading></Loading>
    }



    return (
        <div className='w-96 p-7'>
        <h2 className="text-4xl">Add An Item</h2>
        <form onSubmit={handleSubmit(handleAddDoctor)}>
            <div className="form-control w-full max-w-xs">
                <label className="label"> <span className="label-text">Name</span></label>
                <input type="text" {...register("name", {
                    required: "Name is Required"
                })} className="input input-bordered w-full max-w-xs" />
                {errors.name && <p className='text-red-500'>{errors.name.message}</p>}
            </div>
            <div className="form-control w-full max-w-xs">
                <label className="label"> <span className="label-text">Stock</span></label>
                <input type="number" {...register("stock", {
                    required: true
                })} className="input input-bordered w-full max-w-xs" />
                {errors.stock && <p className='text-red-500'>{errors.stock.message}</p>}
            </div>
            <div className="form-control w-full max-w-xs">
                <label className="label"> <span className="label-text">Price</span></label>
                <input type="number" {...register("price", {
                    required: true
                })} className="input input-bordered w-full max-w-xs" />
                {errors.price && <p className='text-red-500'>{errors.price.message}</p>}
            </div>
            <div className="form-control w-full max-w-xs">
                <label className="label"> <span className="label-text">Category</span></label>
                <select 
                {...register('specialty')}
                className="select input-bordered w-full max-w-xs">
                    {
                        specialties.map(specialty => <option
                            key={specialty._id}
                            value={specialty.name}
                        >{specialty.displayName}</option>)
                    }
                    
                    
                </select>
            </div>
            <div className="form-control w-full max-w-xs">
                <label className="label"> <span className="label-text">Photo</span></label>
                <input type="file" {...register("image", {
                    required: "Photo is Required"
                })} className="input input-bordered w-full max-w-xs" />
                {errors.img && <p className='text-red-500'>{errors.img.message}</p>}
            </div>
            <input className='btn btn-accent w-full mt-4' value="Add Item" type="submit" />
        </form>
    </div>
    );
};


/**
 * Three places to store images
 * 1. Third party image hosting server 
 * 2. File system of your server
 * 3. mongodb (database)
*/




export default AddItem;