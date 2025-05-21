import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
};

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false,
  disabled = false,
  fullWidth = false
}: ButtonProps) {
  const baseStyle = "py-3 px-4 rounded-lg flex-row justify-center items-center";
  
  const variantStyles = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    outline: "border border-primary"
  };
  
  const textStyles = {
    primary: "text-white font-medium",
    secondary: "text-white font-medium",
    outline: "text-primary font-medium"
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseStyle} ${variantStyles[variant]} ${disabled ? 'opacity-50' : ''} ${fullWidth ? 'w-full' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#0070f3' : 'white'} />
      ) : (
        <Text className={textStyles[variant]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
