import React from 'react';

const AvailableAmbulance = ({ ambulances }) => {

    return (
        <section className='my-16'>
            <p className='text-center text-secondary font-bold'>Available Ambulances</p>
            <div className='grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6'>
                {
                    ambulances.map(ambulance => (<div className="card shadow-xl">
                        <div className="card-body text-center">
                            <h2 className="text-2xl text-secondary font-bold text-center">{ambulance.name}</h2>
                            <p>Phone: {ambulance.phone}</p>
                            <div className="card-actions justify-center">
                                <a
                                    href={`tel:${ambulance.phone}`}
                                    class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                >
                                    Call
                                </a>

                            </div>
                        </div>
                    </div>))
                }
            </div>
        </section>
    );
};

export default AvailableAmbulance;