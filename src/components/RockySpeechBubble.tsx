import React from 'react';
import rockyYellowLogo from '/rockyYellow.svg';
import textBubble from '/textBubble.svg';

interface RockySpeechBubbleProps {
  text: string;
  className?: string;
}

const RockySpeechBubble: React.FC<RockySpeechBubbleProps> = ({ text, className = '' }) => {
  return (
    <div className={`rocky-speech-bubble ${className}`}>
      <div className="rocky-speech-container">
        <div className="rocky-container">
          <img 
            src={rockyYellowLogo} 
            alt="Rocky" 
            className="rocky-yellow-logo"
          />
        </div>
        <div className="speech-bubble-container">
          <img 
            src={textBubble} 
            alt="Speech bubble" 
            className="speech-bubble"
          />
          <div className="bubble-text">
            {text}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RockySpeechBubble;
