import React from 'react';

interface HowItWorksStepProps {
	number: number;
	title: string;
	description: string;
	bgColor?: string;
}

const HowItWorksStep: React.FC<HowItWorksStepProps> = ({
	number,
	title,
	description,
	bgColor = 'bg-primary',
}) => {
	return (
		<div className="flex items-start gap-4">
			<div
				className={`flex-shrink-0 w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white font-bold`}
			>
				{number}
			</div>
			<div>
				<h3 className="text-xl font-semibold mb-2">{title}</h3>
				<p className="text-text-secondary">{description}</p>
			</div>
		</div>
	);
};

export default HowItWorksStep;
