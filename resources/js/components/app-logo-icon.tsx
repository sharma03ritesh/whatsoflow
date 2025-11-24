import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4A90E2"></stop>
                    <stop offset="100%" stopColor="#8E44AD"></stop>
                </linearGradient>
            </defs>
            
            {/* Flow Shape */}
            <path d="M40 120C40 70 80 40 120 40C160 40 200 70 200 120C200 170 160 200 120 200C80 200 40 170 40 120Z" stroke="url(#flowGradient)" strokeWidth="16" fill="none" strokeLinecap="round"></path>

            {/* Inner flowing line */}
            <path d="M60 120C60 90 90 70 120 70C150 70 180 90 180 120C180 150 150 170 120 170C90 170 60 150 60 120Z" stroke="url(#flowGradient)" strokeWidth="8" fill="none" strokeLinecap="round"></path>
        </svg>
    );
}
