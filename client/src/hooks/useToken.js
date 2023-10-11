import { useState } from 'react';

export default function useToken() {
    const getToken = () => {
        if (localStorage.getItem('accessToken')) {
            const tokenString = localStorage.getItem('accessToken');
            const userToken = JSON.parse(tokenString);
            console.log(userToken);
            return userToken;
        }else {
            return null;
        }
    };

    const [token, setToken] = useState(getToken());

    const saveToken = (userToken) => {
        localStorage.setItem('accessToken', JSON.stringify(userToken));
        setToken(userToken);
    };

    return {
        setToken: saveToken,
        token,
    };
}
