"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
const App = () => {
	return (
		<div className="min-h-screen text-center text-white flex flex-col justify-between">
			<div>
				<Header>一系列实用脚本</Header>
				<div className="flex flex-col justify-center pb-8">
					<a href="/solanaCloseAccount" className="text-center text-[#808080] mt-4 break-words">
						solana关闭空Token账户
					</a>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default App;