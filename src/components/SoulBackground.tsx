import React from 'react';

export const SoulBackground: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      style={{ contain: 'strict' }}
      aria-hidden="true"
    >
      {/* Soul 1 - Bottom Left - Crimson (Failure / Grave Ember) */}
      <div 
        className="absolute bottom-[10%] left-[8%] w-48 sm:w-72 h-48 sm:h-72 bg-code-red/5 rounded-full blur-[45px] sm:blur-[80px] animate-soul-float" 
        style={{ animationDelay: '0s', animationDuration: '22s', contain: 'strict', willChange: 'transform' }}
      />
      
      {/* Soul 2 - Top Right - Blood Red (Crypt Warmth) */}
      <div 
        className="absolute top-[15%] right-[10%] w-64 sm:w-96 h-64 sm:h-96 bg-[#c53030]/5 rounded-full blur-[50px] sm:blur-[90px] animate-soul-float" 
        style={{ animationDelay: '5s', animationDuration: '28s', contain: 'strict', willChange: 'transform' }}
      />
      
      {/* Soul 3 - Mid Left - Subtle Spectral Amber */}
      <div 
        className="absolute top-[45%] left-[18%] w-28 sm:w-40 h-28 sm:h-40 bg-amber-500/5 rounded-full blur-[35px] sm:blur-[60px] animate-soul-float" 
        style={{ animationDelay: '2s', animationDuration: '16s', contain: 'strict', willChange: 'transform' }}
      />
      
      {/* Soul 4 - Bottom Right - Ethereal Teal / Emerald */}
      <div 
        className="absolute bottom-[12%] right-[22%] w-44 sm:w-64 h-44 sm:h-64 bg-teal-800/5 rounded-full blur-[40px] sm:blur-[70px] animate-soul-float" 
        style={{ animationDelay: '9s', animationDuration: '24s', contain: 'strict', willChange: 'transform' }}
      />
    </div>
  );
};
