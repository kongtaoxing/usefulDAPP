"use client";

export default function Footer() {
	return (
		<div className="flex justify-center items-center pb-8">
			<img alt="Twitter Logo" className="w-9 h-9" src="/image/twitter-logo.svg" />
			<a
				className="text-white text-base font-bold"
				href="https://twitter.com/kongtaoxing"
				target="_blank"
				rel="noreferrer"
			>{`built by @kongtaoxing`}</a>
		</div>
	);
}
