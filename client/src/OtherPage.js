import React from 'react';
import {Link } from 'react-router-dom';

export default () => {
    return (
        <div> 
            Im someother page!
            <Link to="/"> Go back Home</Link>
        </div>
    )
}