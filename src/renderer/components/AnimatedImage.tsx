import React, { useState, useEffect, CSSProperties } from 'react';
import '@styles/animatedImage.css';

interface AnimatedImageProps {
  src: string;
  alt?: string;
  title?: string;
  width?: string;
  style?: CSSProperties;
}

// Component *AnimatedImage* describing an animated image that fades-in and out on change
const AnimatedImage: React.FC<AnimatedImageProps> = ({ src, alt = 'image', title, width, style }) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [isLoaded, setIsLoaded] = useState<boolean>(true); // Initially set to true
  const [flash, setFlash] = useState<boolean>(false); // To handle the flash effect

  useEffect(() => {
    if (currentSrc !== src) {
      // Trigger animations only if the src actually changes
      setIsLoaded(false); // Start fade-out when the src changes
      setFlash(true); // Trigger the flash effect

      const timer = setTimeout(() => {
        setCurrentSrc(src); // Change the image source after the fade-out
        setFlash(false); // Remove the flash effect
      }, 1000); // 1000ms fade-out duration

      return () => clearTimeout(timer); // Clean up the timer on unmount
    }
  }, [src, currentSrc]);

  const handleImageLoad = () => {
    setIsLoaded(true); // Trigger fade-in after the image loads
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      title={title}
      width={width}
      style={style}
      className={`${isLoaded ? 'fade-in' : 'fade-out'} ${flash ? 'flash' : ''}`} // Apply the flash class
      onLoad={handleImageLoad} // Trigger fade-in after the image loads
    />
  );
};

export default AnimatedImage;
