import React from 'react';

const Loader = ({ 
  size = 'md', 
  color = 'amber', 
  text = 'Loading...',
  showText = true 
}) => {
  
  // Size mappings
  const sizes = {
    sm: {
      dot: 'w-2 h-2',
      container: 'gap-1',
      text: 'text-xs'
    },
    md: {
      dot: 'w-3 h-3',
      container: 'gap-1.5',
      text: 'text-sm'
    },
    lg: {
      dot: 'w-4 h-4',
      container: 'gap-2',
      text: 'text-base'
    },
    xl: {
      dot: 'w-5 h-5',
      container: 'gap-3',
      text: 'text-lg'
    }
  };

  // Color mappings
  const colors = {
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    indigo: 'bg-indigo-500',
    gray: 'bg-gray-500',
    white: 'bg-white'
  };

  const selectedSize = sizes[size] || sizes.md;
  const selectedColor = colors[color] || colors.amber;

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Container for dots */}
      <div className={`flex ${selectedSize.container}`}>
        {[1, 2, 3, 4, 5].map((dot) => (
          <div
            key={dot}
            className={`
              ${selectedSize.dot}
              ${selectedColor}
              rounded-full
              animate-bounce
              shadow-lg
              ${dot === 1 ? 'animation-delay-0' : ''}
              ${dot === 2 ? 'animation-delay-100' : ''}
              ${dot === 3 ? 'animation-delay-200' : ''}
              ${dot === 4 ? 'animation-delay-300' : ''}
              ${dot === 5 ? 'animation-delay-400' : ''}
            `}
            style={{
              animationDuration: '0.8s'
            }}
          />
        ))}
      </div>

      {/* Optional loading text */}
      {showText && (
        <p className={`
          mt-3 text-gray-400 font-medium ${selectedSize.text}
          animate-pulse
        `}>
          {text}
        </p>
      )}
    </div>
  );
};

// Alternative version with different animation style (Wave)
export const WaveLoader = ({ size = 'md', color = 'amber' }) => {
  const sizes = {
    sm: 'w-1.5 h-4',
    md: 'w-2 h-6',
    lg: 'w-2.5 h-8',
    xl: 'w-3 h-10'
  };

  const colors = {
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  };

  const selectedSize = sizes[size] || sizes.md;
  const selectedColor = colors[color] || colors.amber;

  return (
    <div className="flex items-center justify-center gap-1">
      {[1, 2, 3, 4, 5].map((dot) => (
        <div
          key={dot}
          className={`
            ${selectedSize}
            ${selectedColor}
            rounded-full
            animate-wave
            shadow-lg
          `}
          style={{
            animation: 'wave 1s ease-in-out infinite',
            animationDelay: `${dot * 0.1}s`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1.5); }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Full page loader with backdrop
export const FullPageLoader = ({ text = 'Loading...', color = 'amber' }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800">
        <Loader size="xl" color={color} text={text} />
      </div>
    </div>
  );
};

// Inline loader for buttons
export const ButtonLoader = ({ color = 'amber' }) => {
  return (
    <div className="flex items-center justify-center gap-1">
      {[1, 2, 3].map((dot) => (
        <div
          key={dot}
          className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
          style={{
            animationDelay: `${dot * 0.15}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );
};

// CSS for animation delays (add this to your global CSS or component)
const style = document.createElement('style');
style.textContent = `
  .animation-delay-0 { animation-delay: 0s; }
  .animation-delay-100 { animation-delay: 0.1s; }
  .animation-delay-200 { animation-delay: 0.2s; }
  .animation-delay-300 { animation-delay: 0.3s; }
  .animation-delay-400 { animation-delay: 0.4s; }
  .animation-delay-500 { animation-delay: 0.5s; }
  
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: translateY(-25%);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
  }
  .animate-bounce {
    animation: bounce 1s infinite;
  }
`;
document.head.appendChild(style);

export default Loader;