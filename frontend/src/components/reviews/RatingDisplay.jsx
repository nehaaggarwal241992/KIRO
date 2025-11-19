const RatingDisplay = ({ rating, maxRating = 5, size = 'medium', showNumber = true }) => {
  const sizeStyles = {
    small: { fontSize: 'var(--font-size-sm)' },
    medium: { fontSize: 'var(--font-size-lg)' },
    large: { fontSize: 'var(--font-size-2xl)' },
  };

  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= maxRating; i++) {
      const isFilled = i <= rating;
      const isPartial = i === Math.ceil(rating) && rating % 1 !== 0;
      
      stars.push(
        <span
          key={i}
          className="star"
          style={{
            ...sizeStyles[size],
            color: isFilled ? 'var(--accent-color)' : 'var(--gray-300)',
            textShadow: isFilled ? '0 0 4px rgba(245, 158, 11, 0.3)' : 'none',
            transition: 'all var(--transition-fast)',
            display: 'inline-block',
            ...(isPartial && {
              background: `linear-gradient(90deg, var(--accent-color) ${(rating % 1) * 100}%, var(--gray-300) ${(rating % 1) * 100}%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            })
          }}
        >
          ★
        </span>
      );
    }
    
    return stars;
  };

  return (
    <div className="flex items-center gap-2">
      <div className="star-rating">
        {renderStars()}
      </div>
      {showNumber && (
        <span style={{ 
          color: 'var(--gray-600)', 
          fontSize: sizeStyles[size].fontSize,
          fontWeight: '500'
        }}>
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

export default RatingDisplay;