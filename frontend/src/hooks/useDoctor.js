import { useEffect, useState } from "react";






const useDoctor = email => {
    const [isDoctor, setIsDoctor] = useState(false);
    const [isApproved, setIsApproved] = useState(false)
    const [doctorDetails, setDoctorDetails] = useState(false)
    const [isDoctorLoading, setIsDoctorLoading] = useState(true);
    useEffect(() => {
        if (email) {
            fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/doctors/getByEmail/${email}`)
                .then(res => {
                    if (res.status === 404) {
                        return null;
                    }
                    return res.json();
                })
                .then(data => {
                    if (data) {
                        console.log(data);
                        setIsDoctor(true);
                        setIsApproved(data.isApproved);
                        setDoctorDetails(data);
                        setIsDoctorLoading(false);
                    }
                    else {
                        setIsDoctorLoading(false);
                    }
                })
        }
    }, [email])
    return [isDoctor, isApproved, doctorDetails, isDoctorLoading]
}

export default useDoctor;