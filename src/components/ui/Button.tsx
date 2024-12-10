import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

// Add this buttonVariants function
const buttonVariants = ({
  variant = 'default',
  size = 'default',
  className = ''
}: {
  variant?: ButtonProps['variant'],
  size?: ButtonProps['size'],
  className?: string
} = {}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2";

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline"
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10"
  };

  return cn(
    baseStyles,
    variants[variant],
    sizes[size],
    className
  );
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className,
  onClick,
  variant = 'default',
  size = 'default',
  disabled,
  type = 'button',
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        buttonVariants({ variant, size }),
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button, buttonVariants, type ButtonProps };