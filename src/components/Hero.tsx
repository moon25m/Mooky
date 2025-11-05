import React from 'react';
import '../styles/hero.css';

type HeroProps = {
	backgroundImage?: string;
	children: React.ReactNode;
};

const Hero: React.FC<HeroProps> = ({ backgroundImage, children }) => {
	return (
		<section className="hero">
			{backgroundImage && (
				<div className="hero-bg" style={{ backgroundImage: `url(${backgroundImage})` }} aria-hidden="true" />
			)}
			<div className="hero-content">
				{children}
			</div>
		</section>
	);
};

export default Hero;
