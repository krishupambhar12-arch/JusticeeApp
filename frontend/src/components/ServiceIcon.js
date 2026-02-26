import React from 'react';

const ServiceIcon = ({ iconName, iconFile, size = 48, className = '' }) => {
  console.log('ServiceIcon props:', { iconName, iconFile, size, className });
  
  // If there's an uploaded icon file, display it
  if (iconFile) {
    const iconUrl = iconFile.startsWith('http') ? iconFile : `http://localhost:5000/uploads/service-icons/${iconFile}`;
    console.log('Displaying uploaded icon:', iconUrl);
    
    return (
      <img 
        src={iconUrl}
        alt={iconName || 'Service Icon'}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          display: 'inline-block',
          objectFit: 'contain',
          borderRadius: '8px'
        }} 
        className={className}
        onError={(e) => {
          console.error('Failed to load service icon:', iconUrl);
          // Simple fallback - show placeholder text
          e.target.style.display = 'none';
          const parent = e.target.parentElement;
          if (!parent.dataset.placeholderAdded) {
            parent.innerHTML += `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;background:#f8f9fa;border:2px solid #e9ecef;border-radius:50%;font-size:${size/2}px;color:#6c757d;">⚖️</div>`;
            parent.dataset.placeholderAdded = 'true';
          }
        }}
        onLoad={() => {
          console.log('Service icon loaded successfully:', iconUrl);
        }}
      />
    );
  }
  
  // If no uploaded file, show placeholder with legal icon
  console.log('No icon file provided, showing placeholder');
  return (
    <div 
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        border: '2px solid #e9ecef',
        borderRadius: '50%',
        fontSize: `${size/2}px`,
        color: '#6c757d'
      }} 
      className={className}
    >
      ⚖️
    </div>
  );
};

export default ServiceIcon;