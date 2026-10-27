import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger'
  children: React.ReactNode
  className?: string
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children, 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 transform active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer'
  
  const variants = {
    primary: 'bg-[#5B9CD8] hover:bg-[#4B8ECB] text-white hover:shadow-lg hover:-translate-y-0.5',
    secondary: 'bg-white hover:bg-slate-50 text-[#1A2C42] border border-slate-200 hover:border-[#5B9CD8] hover:shadow-md',
    accent: 'bg-[#F5D372] hover:bg-[#eac459] text-[#1A2C42] hover:shadow-lg hover:-translate-y-0.5',
    danger: 'bg-[#E96A6A] hover:bg-[#d85555] text-white hover:shadow-lg hover:-translate-y-0.5',
  }

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}