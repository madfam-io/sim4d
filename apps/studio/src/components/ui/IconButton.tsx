import React from 'react';
import { Button, ButtonProps } from './Button';
import type { IconName } from '../icons/IconSystem';

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'icon'> {
  icon: IconName;
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, ...props }, ref) => {
    return <Button ref={ref} icon={icon} {...props} />;
  }
);

IconButton.displayName = 'IconButton';
