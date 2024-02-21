import React, { useState } from 'react';
import AccessoriesCategories from '../AccessoriesCategories/AccessoriesCategories';
import AvailableItems from '../AvailableItems/AvailableItems';


const Accessories = () => {
    const [selectedCategory, setSelectedCategory] = useState('painkiller');
    return (
        <div>
            <AccessoriesCategories
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
            />

            <AvailableItems
                selectedCategory={selectedCategory}
            ></AvailableItems>

        </div>
    );
};

export default Accessories;