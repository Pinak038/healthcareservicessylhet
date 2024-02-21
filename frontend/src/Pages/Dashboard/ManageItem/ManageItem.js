import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../Shared/ConfirmationModal/ConfirmationModal';
import Loading from '../../Shared/Loading/Loading';
import EditItem from '../EditItem/EditItem';

const ManageItem = () => {
    const [deletingItem, setDeletingItem] = useState(null);
    const [editingItem, setEditingItem] = useState(null);

    const closeModal = () => {
        setDeletingItem(null);
        setEditingItem(null);
    }

    useEffect(() => {
        console.log(editingItem)
    }, [editingItem])

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/itemCategories`);
            const data = await res.json();
            return data;
        }
    })


    const { data: items, isLoading, refetch } = useQuery({
        queryKey: ['items'],
        queryFn: async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/items`, {
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

    const handleDeleteItem = item => {
        fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/items/${item._id}`, {
            method: 'DELETE',
            headers: {
                authorization: `bearer ${localStorage.getItem('accessToken')}`
            }
        })
            .then(res => res.json())
            .then(data => {
                // console.log(data);
                if (data.deletedCount > 0) {
                    refetch();
                    toast.success(`Item ${item.name} deleted successfully`)
                }
            })
    }

    if (isLoading) {
        return <Loading></Loading>
    }



    return (
        <div>
            <h2 className="text-3xl">Manage Items: {items?.length}</h2>
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Stock</th>
                            <th>Price</th>
                            <th>Category</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items &&
                            items.map((item, i) => <tr key={item._id}>
                                <th>{i + 1}</th>
                                <td><div className="avatar">
                                    <div className="w-24 rounded-full">
                                        <img src={item.image} alt="" />
                                    </div>
                                </div></td>
                                <td>{item.name}</td>
                                <td>{item.stock}</td>
                                <td>{item.price}</td>
                                <td>{item.category}</td>
                                <td>
                                    <label onClick={() => setEditingItem(item)} htmlFor="editing-modal" className="btn btn-sm btn-success">Edit</label>
                                    <label onClick={() => setDeletingItem(item)} htmlFor="confirmation-modal" className="btn btn-sm btn-error">Delete</label>
                                </td>
                            </tr>)
                        }
                    </tbody>
                </table>
            </div>
            {
                deletingItem && <ConfirmationModal
                    title={`Are you sure you want to delete?`}
                    message={`If you delete ${deletingItem.name}. It cannot be undone.`}
                    successAction={handleDeleteItem}
                    successButtonName="Delete"
                    modalData={deletingItem}
                    closeModal={closeModal}
                >
                </ConfirmationModal>
            }
            
            {
                editingItem &&
                <EditItem
                    editingItem={editingItem}
                    setEditingItem={setEditingItem}
                    categories={categories}
                    refetch={refetch}
                ></EditItem>
            }
        </div>
    );
};

export default ManageItem;