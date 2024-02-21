import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const EditItem = ({ editingItem, setEditingItem, categories, refetch }) => {

    const { _id } = editingItem;
    // const {user} = useContext(AuthContext);
    const { register, handleSubmit, formState: { errors } } = useForm({
        values: editingItem,
    });

    const imageHostKey = process.env.REACT_APP_imgbb_key;
    console.log(imageHostKey);

    const handleAddEdit = data => {
        console.log(data);
        const image = data.image[0];
        const formData = new FormData();
        formData.append('image', image);
        const url = `https://api.imgbb.com/1/upload?key=${imageHostKey}`
        fetch(url, {
            method: 'POST',
            body: formData
        })
            .then(res => {
                if (res.status !== 200) {
                    return null;
                }
                return res.json();
            })
            .then(imgData => {
                const item = {
                    name: data.name,
                    stock: data.stock,
                    price: data.price,
                    category: data.category,
                    image: imgData ? imgData.data.url : editingItem.image,
                }

                // save doctor information to the database
                fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/items/${_id}`, {
                    method: 'PUT',
                    headers: {
                        'content-type': 'application/json',
                        authorization: `bearer ${localStorage.getItem('accessToken')}`
                    },
                    body: JSON.stringify(item)
                })
                    .then(res => res.json())
                    .then(result => {
                        console.log(result);
                        setEditingItem(null);
                        toast.success(`${data.name} is edited successfully`);
                        refetch();
                    })
            })
    }


    return (
        <div>
            <input type="checkbox" id="editing-modal" className="modal-toggle" />
            <div className="modal">
                <div className="modal-box">
                    <label htmlFor="editing-modal" className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
                    <h3 className="text-lg font-bold">Edit item</h3>
                    <form onSubmit={handleSubmit(handleAddEdit)}>
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
                                {...register('category')}
                                className="select input-bordered w-full max-w-xs">
                                {
                                    categories.map(category => <option
                                        key={category._id}
                                        value={category.name}
                                    >{category.displayName}</option>)
                                }


                            </select>
                        </div>
                        <div className="form-control w-full max-w-xs">
                            <label className="label"> <span className="label-text">Photo</span></label>
                            <input type="file" {...register("image")} className="input input-bordered w-full max-w-xs" />
                            {errors.img && <p className='text-red-500'>{errors.img.message}</p>}
                        </div>
                        <input className='btn btn-accent w-full mt-4' value="Add Item" type="submit" />
                    </form>
                </div>
            </div>
        </div>
    );

};

export default EditItem;