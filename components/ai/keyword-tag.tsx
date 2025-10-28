'use client';

interface KeywordTagProps {
    keyword: string;
    score: number;
    onClick?: () => void;
}

export function KeywordTag({ keyword, score, onClick }: KeywordTagProps) {
    // Size based on relevance score (0.0-1.0)
    const minSize = 0.75;
    const maxSize = 1.1;
    const fontSize = `${minSize + (score * (maxSize - minSize))}rem`;

    // Opacity based on score
    const minOpacity = 0.6;
    const maxOpacity = 1.0;
    const opacity = minOpacity + (score * (maxOpacity - minOpacity));

    // Color intensity based on score
    const getColorClass = () => {
        if (score >= 0.7) {
            return 'bg-primary text-primary-foreground';
        } else if (score >= 0.4) {
            return 'bg-primary/70 text-primary-foreground';
        } else {
            return 'bg-secondary text-secondary-foreground';
        }
    };

    const Component = onClick ? 'button' : 'span';

    return (
        <Component
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-all ${getColorClass()} ${onClick ? 'cursor-pointer hover:scale-110 hover:shadow-md active:scale-95' : 'hover:opacity-100'
                }`}
            style={{
                fontSize,
                opacity: onClick ? 1 : opacity // Always full opacity if clickable
            }}
            onClick={onClick}
            title={`Relevance: ${(score * 100).toFixed(0)}% ${onClick ? '(Click to search)' : ''}`}
            aria-label={`Keyword: ${keyword}, relevance ${(score * 100).toFixed(0)}%`}
        >
            <span>{keyword}</span>
            {score >= 0.7 && (
                <span className="text-[10px] opacity-75">★</span>
            )}
        </Component>
    );
}