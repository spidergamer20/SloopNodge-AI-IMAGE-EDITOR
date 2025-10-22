import React from 'react';
import { AspectRatio } from '../../types';

interface AspectRatioIconProps {
  ratio: AspectRatio;
}

export const AspectRatioIcon: React.FC<AspectRatioIconProps> = ({ ratio }) => {
  let path;
  switch (ratio) {
    case '16:9':
      path = <rect x="3" y="7" width="18" height="10" rx="2" />;
      break;
    case '9:16':
      path = <rect x="7" y="3" width="10" height="18" rx="2" />;
      break;
    case '1:1':
    default:
      path = <rect x="5" y="5" width="14" height="14" rx="2" />;
      break;
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {path}
    </svg>
  );
};