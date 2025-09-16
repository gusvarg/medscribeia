import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface SliderCaptchaProps {
  onSuccess: () => void;
  onReset?: () => void;
  isDarkMode?: boolean;
}

const SliderCaptcha: React.FC<SliderCaptchaProps> = ({ onSuccess, onReset, isDarkMode = false }) => {
  const [isSliding, setIsSliding] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  
  const threshold = 85; // Porcentaje para completar el captcha

  const handleMouseDown = useCallback(() => {
    if (!isCompleted) {
      setIsDragging(true);
      setIsSliding(true);
    }
  }, [isCompleted]);

  const handleMouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!isDragging || !trackRef.current || isCompleted) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
    
    if (newPosition >= 0 && newPosition <= 95) {
      setSliderPosition(Math.max(0, Math.min(95, newPosition)));
    }
  }, [isDragging, isCompleted]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    setIsSliding(false);
    
    console.log('Mouse up - position:', sliderPosition, 'threshold:', threshold);
    
    if (sliderPosition >= threshold && !isCompleted) {
      console.log('Captcha completado!');
      setIsCompleted(true);
      setTimeout(() => {
        onSuccess();
      }, 200);
    } else {
      // Reset si no se completó
      console.log('Captcha no completado, reseteando');
      setTimeout(() => {
        setSliderPosition(0);
      }, 200);
    }
  }, [isDragging, sliderPosition, threshold, onSuccess, isCompleted]);

  // Verificar si el captcha se completó basado en la posición actual
  React.useEffect(() => {
    if (!isDragging && sliderPosition >= threshold && !isCompleted) {
      console.log('Efecto: Completando captcha por posición');
      setIsCompleted(true);
      onSuccess();
    }
  }, [sliderPosition, threshold, isCompleted, isDragging, onSuccess]);

  // Event listeners para mouse global
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const reset = () => {
    setSliderPosition(0);
    setIsCompleted(false);
    setIsDragging(false);
    setIsSliding(false);
    if (onReset) onReset();
  };

  return (
    <div className="w-full space-y-2">
      <div
        ref={trackRef}
        className={`relative h-12 rounded-xl border-2 overflow-hidden cursor-pointer select-none ${
          isDarkMode 
            ? 'bg-gray-800/50 border-gray-600' 
            : 'bg-gray-100 border-gray-300'
        } ${isCompleted ? 'border-green-500' : ''}`}
        onMouseMove={handleMouseMove}
      >
        {/* Fondo del progreso */}
        <div
          className={`absolute top-0 left-0 h-full transition-all duration-200 ${
            isCompleted 
              ? 'bg-green-500/30' 
              : isDarkMode 
                ? 'bg-blue-600/30' 
                : 'bg-blue-500/30'
          }`}
          style={{ width: `${sliderPosition + 5}%` }}
        />
        
        {/* Texto instructivo */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <span className={`text-sm font-medium transition-opacity ${
            sliderPosition > 20 ? 'opacity-0' : 'opacity-100'
          }`}>
            {isCompleted ? '¡Verificado!' : 'Desliza para verificar →'}
          </span>
        </div>
        
        {/* Slider button */}
        <motion.div
          ref={sliderRef}
          className={`absolute top-1 left-1 w-10 h-10 rounded-lg cursor-grab active:cursor-grabbing flex items-center justify-center shadow-lg transition-all duration-200 ${
            isCompleted 
              ? 'bg-green-500 text-white' 
              : isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                : 'bg-blue-500 hover:bg-blue-400 text-white'
          } ${isDragging ? 'scale-110' : ''}`}
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          onMouseDown={handleMouseDown}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isCompleted ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </motion.div>
      </div>
      
      {/* Botón de reset (opcional) */}
      {isCompleted && (
        <button
          onClick={reset}
          className={`text-xs underline ${
            isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Reintentar verificación
        </button>
      )}
    </div>
  );
};

export default SliderCaptcha;