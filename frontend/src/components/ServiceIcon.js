import React from 'react';

const ServiceIcon = ({ iconName, iconFile, size = 24, className = '' }) => {
  // Debug: Log props
  console.log('ServiceIcon props:', { iconName, iconFile, size, className });
  
  // If there's an uploaded icon file, display it
  if (iconFile) {
    console.log('Displaying uploaded icon:', iconFile);
    return (
      <img 
        src={`http://localhost:5000/uploads/service-icons/${iconFile}`}
        alt={iconName || 'Service Icon'}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          display: 'inline-block',
          objectFit: 'cover'
        }} 
        className={className}
        onError={(e) => {
          // If image fails to load, show a placeholder
          console.error('Failed to load service icon:', iconFile, e);
          e.target.style.display = 'none';
          const placeholder = document.createElement('div');
          placeholder.style.width = `${size}px`;
          placeholder.style.height = `${size}px`;
          placeholder.style.display = 'inline-block';
          placeholder.style.backgroundColor = '#f0f0f0';
          placeholder.style.border = '1px solid #ddd';
          placeholder.style.borderRadius = '4px';
          placeholder.style.textAlign = 'center';
          placeholder.style.lineHeight = `${size}px`;
          placeholder.style.fontSize = `${size/3}px`;
          placeholder.style.color = '#999';
          placeholder.textContent = '📁';
          placeholder.className = className;
          e.target.parentNode.insertBefore(placeholder, e.target.nextSibling);
        }}
        onLoad={() => {
          // Debug: Log when image loads successfully
          console.log('Service icon loaded successfully:', iconFile);
        }}
      />
    );
  }
  
  // If no uploaded file, show placeholder
  return (
    <div 
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        display: 'inline-block',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ddd',
        borderRadius: '4px',
        textAlign: 'center',
        lineHeight: `${size}px`,
        fontSize: `${size/3}px`,
        color: '#999'
      }} 
      className={className}
    >
      📁
    </div>
  );
};

export default ServiceIcon;
