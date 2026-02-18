import React from 'react';

// Fallback icons using Unicode symbols for now
const fallbackIcons = {
  'Gavel': '⚖️',
  'Balance': '⚖️',
  'Description': '📄',
  'AccountBalance': '🏛️',
  'Business': '💼',
  'FamilyRestroom': '👨‍👩‍👧‍👦',
  'Security': '🔒',
  'HealthAndSafety': '⚕️',
  'School': '🎓',
  'Work': '💼',
  'Home': '🏠',
  'Car': '🚗',
  'LocalHospital': '🏥',
  'AttachMoney': '💰',
  'Handshake': '🤝',
  'Assignment': '📋',
  'FolderSpecial': '📁',
  'LibraryBooks': '📚',
  'Policy': '📋',
  'VerifiedUser': '✅',
  'Support': '💬',
  'Groups': '👥',
  'Apartment': '🏢',
  'Domain': '🌐',
  'RealEstateAgent': '🏠',
  'TravelExplore': '🔍',
  'CreditCard': '💳',
  'Savings': '💰',
  'TrendingUp': '📈',
  'Analytics': '📊',
  'Assessment': '📝',
  'Checklist': '✅',
  'FactCheck': '✔️'
};

const ServiceIcon = ({ iconName, size = 24, className = '' }) => {
  const icon = fallbackIcons[iconName] || fallbackIcons['Gavel'];
  
  return (
    <span 
      style={{ 
        fontSize: `${size}px`, 
        display: 'inline-block',
        lineHeight: 1
      }} 
      className={className}
    >
      {icon}
    </span>
  );
};

export default ServiceIcon;
