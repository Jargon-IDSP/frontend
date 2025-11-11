import React from 'react';
import type { RockySpeechBubbleProps } from '../types/rockySpeechBubble';
import rockyYellowLogo from '/rockyYellow.svg?url';
import textBubble from '/textBubble.svg?url';

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
