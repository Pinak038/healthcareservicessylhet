import { useQuery } from '@tanstack/react-query';
import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../Contexts/AuthProvider';
import Loading from '../../Shared/Loading/Loading';
import useDoctor from '../../../hooks/useDoctor';

const MyProfile = () => {
    const { user } = useContext(AuthContext);
    const [isDoctor, isApproved, doctorDetails] = useDoctor(user?.email);

    const { register, handleSubmit, formState: { errors } } = useForm({
        values: isDoctor ? doctorDetails : {
            name: user.displayName,
            email: user.email,
        },
    });

    const imageHostKey = process.env.REACT_APP_imgbb_key;
    console.log(imageHostKey);
    const navigate = useNavigate();

    const { data: specialties, isLoading } = useQuery({
        queryKey: ['specialty'],
        queryFn: async () => {
            const res = await fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/specialties`);
            const data = await res.json();
            return data;
        }
    })

    const handleUpdateProfile = data => {
        console.log(data);
        if (isDoctor) {
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
                    console.log(imgData);
                    const doctor = {
                        // name: data.name,
                        // email: data.email,
                        specialty: data.specialty,
                        image: imgData ? imgData.data.url : doctorDetails.image,
                    }

                    // save doctor information to the database
                    fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/doctors/${doctorDetails._id}`, {
                        method: 'put',
                        headers: {
                            'content-type': 'application/json',
                            authorization: `bearer ${localStorage.getItem('accessToken')}`
                        },
                        body: JSON.stringify(doctor)
                    })
                        .then(res => res.json())
                        .then(result => {
                            console.log(result);
                            toast.success(`Profile is updated successfully`);
                            navigate(0)
                        })
                })
        }

    }

    if (isLoading) {
        return <Loading></Loading>
    }



    return (
        <div className='w-96 p-7'>
            {isDoctor && doctorDetails?.image && (
                <div className="avatar">
                    <div className="w-24 rounded-full">
                        <img src={doctorDetails.image} alt="" />
                    </div>
                </div>
            )}
            <h2 className="text-4xl">My Profile</h2>
            <form onSubmit={handleSubmit(handleUpdateProfile)}>
                <div className="form-control w-full max-w-xs">
                    <label className="label"> <span className="label-text">Name</span></label>
                    <input type="text" {...register("name", {
                        // required: "Name is Required"
                    })} className="input input-bordered w-full max-w-xs"
                        disabled />
                    {errors.name && <p className='text-red-500'>{errors.name.message}</p>}
                </div>
                <div className="form-control w-full max-w-xs">
                    <label className="label"> <span className="label-text">Email</span></label>
                    <input type="email" {...register("email", {
                        // required: true
                    })} className="input input-bordered w-full max-w-xs"
                        disabled />
                    {errors.email && <p className='text-red-500'>{errors.email.message}</p>}
                </div>

                {isDoctor && (
                    <>
                        <div className="form-control w-full max-w-xs">
                            <label className="label"> <span className="label-text">Specialty</span></label>
                            <select
                                {...register('specialty', {
                                    required: true
                                })}
                                className="select input-bordered w-full max-w-xs"

                            >
                                {
                                    specialties.map(specialty => <option
                                        key={specialty._id}
                                        value={specialty.name}
                                    >{specialty.name}</option>)
                                }
                            </select>
                        </div>

                        <div className="form-control w-full max-w-xs">
                            <label className="label"> <span className="label-text">Photo</span></label>
                            <input type="file" {...register("image")} className="input input-bordered w-full max-w-xs" />
                            {errors.img && <p className='text-red-500'>{errors.img.message}</p>}
                        </div>

                        <input className='btn btn-accent w-full mt-4' value="Update Profile" type="submit" />
                    </>
                )}


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




export default MyProfile;