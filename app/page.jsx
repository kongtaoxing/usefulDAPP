"use client";

import React from "react";

const App = () => {
	return (
		<div className="min-h-screen bg-black text-center text-white">
			<div className="flex justify-center w-full pt-24 bg-black">
				<div className="flex flex-col justify-center max-w-lg">
					<div className="text-center text-3xl font-semibold">
						一系列实用脚本前端版
					</div>

					<br />

					<a href="https://useful-dapp-git-basemainnet-kongtaoxing.vercel.app/" 
						className="text-center text-[#808080] mt-4 break-words">
						<del>1. base主网纪念NFT铸造</del>(已结束)
					</a>

					<a href="https://useful-dapp-git-opmintfun-kongtaoxing.vercel.app/" className="text-center text-[#808080] mt-4 break-words">
						<del>2.mint.fun上线OP纪念NFT批量mint</del>(已结束)
					</a>

					<a href="https://useful-dapp-git-starkwars-kongtaoxing.vercel.app/" className="text-center text-[#808080] mt-4 break-words">
						<del>3. starkwar一次铸造5个</del>(已结束)
					</a>

					<a href="https://useful-dapp-git-muaverse-kongtaoxing.vercel.app/" className="text-center text-[#808080] mt-4 break-words">
						4. muaverse批量邀请(有手续费)
					</a>

					<a href="https://useful-dapp-git-opmintfun-kongtaoxing.vercel.app/" className="text-center text-[#808080] mt-4 break-words">
						<del>5. mint.fun上线OP纪念NFT批量mint</del>(已结束)
					</a>

					<a href="https://useful-dapp-git-scrollca-kongtaoxing.vercel.app/" className="text-center text-[#808080] mt-4 break-words">
						6. scroll主网低gas一键部署智能合约
					</a>

					<a href='https://useful-dapp-git-quantumleap-kongtaoxing.vercel.app/' className="text-center text-[#808080] mt-4 break-words" disabled>
						7.quantumleap批量铸造(等待开启，暂时不可用)
					</a>

					<br />

					<div className="flex justify-center items-center pb-8">
						<img alt="Twitter Logo" className="w-9 h-9" src="/image/twitter-logo.svg" />
						<a
							className="text-white text-base font-bold"
							href="https://twitter.com/kongtaoxing"
							target="_blank"
							rel="noreferrer"
						>{`built by @kongtaoxing`}</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default App;