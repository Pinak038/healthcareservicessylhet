import React, { useState } from 'react';
import AvailableAmbulance from '../AvailableAmbulance/AvailableAmbulance';
import AmbulanceProviders from '../AmbulanceProviders/AmbulanceProviders';
import ambulanceData from '../ambulance-data.json';

const ambulanceProviders = Object.keys(ambulanceData);

const Ambulance = () => {
    const [selectedProvider, setSelectedProvider] = useState(ambulanceProviders[0]);
    return (
        <div>
            <AmbulanceProviders
                ambulanceProviders={ambulanceProviders}
                selectedProvider={selectedProvider}
                setSelectedProvider={setSelectedProvider}
            />

            <AvailableAmbulance
                ambulances={ambulanceData[selectedProvider]}
            ></AvailableAmbulance>

        </div>
    );
};

export default Ambulance;