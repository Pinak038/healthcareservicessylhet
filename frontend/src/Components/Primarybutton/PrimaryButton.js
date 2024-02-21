import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrimaryButton = ({children}) => {
    const navigate = useNavigate();
    return (
       
                 <button 
        className="btn btn-primary bg-gradient-to-r from-primary to-secondary text-white" onClick={() => {navigate('/appointment')}}>{children}</button>
        
    );
};

export default PrimaryButton;