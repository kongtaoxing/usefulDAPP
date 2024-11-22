"use client";

export default function Header({ children }) {
	return (
		<div className="text-center text-3xl font-semibold pt-32 pb-8 text-white">
			{children}
		</div>
	);
}