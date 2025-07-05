import React from 'react';
import '../css/exam.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
        <div className='loading-image'>
            <img src="loading.gif" className='img_loading' />
        </div>
        <div className='loading-text'>
            <span>Loading...</span>
        </div>
    </div>
  );
};

export default LoadingSpinner;