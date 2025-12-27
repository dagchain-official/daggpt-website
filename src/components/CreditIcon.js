import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const CreditIcon = ({ size = 32 }) => {
  return (
    <div style={{ width: size, height: size }}>
      <DotLottieReact
        src="https://lottie.host/fb8d72b8-603d-4d36-9a66-8b5eb8fee5b4/m8ISwiro6t.lottie"
        loop
        autoplay
      />
    </div>
  );
};

export default CreditIcon;
