import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../Shared/ConfirmationModal/ConfirmationModal';
import Loading from '../../Shared/Loading/Loading';

const ManagedDoctor = () => {
    const [deletingDoctor, setDeletingDoctor] = useState(null);
    const [approvingDoctor, setApprovingDoctor] = useState(null);

    const closeModal = () => {
        setDeletingDoctor(null);
        setApprovingDoctor(null);
    }


    const { data: doctors, isLoading, refetch } = useQuery({
        queryKey: ['doctors'],
        queryFn: async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/doctors`, {
                    headers: {
                        authorization: `bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                const data = await res.json();
                return data;
            }
            catch (error) {

            }
        }
    });


    const handleApproveDoctor = doctor => {
        fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/doctors/${doctor._id}/approve`, {
            method: 'PUT', 
            headers: {
                authorization: `bearer ${localStorage.getItem('accessToken')}`,
                'content-type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            // console.log(data);
            if(data.modifiedCount > 0){
                refetch();
                toast.success(`Doctor ${doctor.name} approved successfully`)
            }
        })
    }

    
    const handleDeleteDoctor = doctor => {
        fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/doctors/${doctor._id}`, {
            method: 'DELETE', 
            headers: {
                authorization: `bearer ${localStorage.getItem('accessToken')}`
            }
        })
        .then(res => res.json())
        .then(data => {
            // console.log(data);
            if(data.deletedCount > 0){
                refetch();
                toast.success(`Doctor ${doctor.name} deleted successfully`)
            }
        })
    }

    if (isLoading) {
        return <Loading></Loading>
    }



    return (
        <div>
        <h2 className="text-3xl">Manage Doctors: {doctors?.length}</h2>
        <div className="overflow-x-auto">
            <table className="table w-full">
                <thead>
                    <tr>
                        <th></th>
                        <th>Avatar</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Specialty</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {   doctors &&
                        doctors.map((doctor, i) => <tr key={doctor._id}>
                            <th>{i + 1}</th>
                            <td><div className="avatar">
                                <div className="w-24 rounded-full">
                                    <img src={doctor.image} alt="" />
                                </div>
                            </div></td>
                            <td>{doctor.name}</td>
                            <td>{doctor.email}</td>
                            <td>{doctor.specialty}</td>
                            <td>
                                <label onClick={() => setDeletingDoctor(doctor)} htmlFor="confirmation-modal" className="btn btn-sm btn-error">Delete</label>
                                {!doctor?.isApproved && (<label onClick={() => setApprovingDoctor(doctor)} htmlFor="confirmation-modal" className="btn btn-sm btn-error">Approve</label>)}
                            </td>
                        </tr>)
                    }
                </tbody>
            </table>
        </div>
        {
            deletingDoctor && <ConfirmationModal
                title={`Are you sure you want to delete?`}
                message={`If you delete ${deletingDoctor.name}. It cannot be undone.`}
                successAction = {handleDeleteDoctor}
                successButtonName="Delete"
                modalData = {deletingDoctor}
                closeModal = {closeModal}
            >
            </ConfirmationModal>
        }
        {
            approvingDoctor && <ConfirmationModal
                title={`Are you sure you want to approve this doctor?`}
                message={`Aprrove ${approvingDoctor.name} as a doctor`}
                successAction = {handleApproveDoctor}
                successButtonName="Approve"
                modalData = {approvingDoctor}
                closeModal = {closeModal}
            >
            </ConfirmationModal>
        }
    </div>
    );
};

export default ManagedDoctor;