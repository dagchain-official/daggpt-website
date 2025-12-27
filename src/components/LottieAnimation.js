import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../animations/gptfloat.json';

const LottieAnimation = () => {
  return (
    <div className="flex justify-center items-center w-full">
      <div className="w-full" style={{ maxWidth: '403px' }}>
        <Lottie 
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: 'auto' }}
        />
      </div>
    </div>
  );
};

export default LottieAnimation;
