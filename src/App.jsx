import React, { useEffect, useState } from "react";
import "./App.css";
import twitterLogo from "./assets/twitter-logo.svg"

const App = () => {

	return (
		<div className="App">
			<div className="mainContainer">
				<div className="dataContainer">
					<div className="header">
						一系列实用脚本前端版
					</div>

					<br></br>

					<a href="https://useful-dapp-git-basemainnet-kongtaoxing.vercel.app/" className="bio">
						<del>1. base主网纪念NFT铸造</del>(已结束)
					</a>

					<a href="https://useful-dapp-git-opmintfun-kongtaoxing.vercel.app/" className="bio">
						<del>2.mint.fun上线OP纪念NFT批量mint</del>(已结束)
					</a>

					<a href="https://useful-dapp-git-starkwars-kongtaoxing.vercel.app/" className="bio">
						<del>3. starkwar一次铸造5个</del>(已结束)
					</a>

					<a href="https://useful-dapp-git-muaverse-kongtaoxing.vercel.app/" className="bio">
						4. muaverse批量邀请(有手续费)
					</a>

					<a href="https://useful-dapp-git-opmintfun-kongtaoxing.vercel.app/" className="bio">
						<del>5. mint.fun上线OP纪念NFT批量mint</del>(已结束)
					</a>

					<a href="https://useful-dapp-git-scrollca-kongtaoxing.vercel.app/" className="bio">
						6. scroll主网低gas一键部署智能合约
					</a>

					<a href='https://useful-dapp-git-quantumleap-kongtaoxing.vercel.app/' className="bio" disabled>
						7.quantumleap批量铸造(等待开启，暂时不可用)
					</a>

					<br></br>

					<div className="footer-container">
						<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
						<a
							className="footer-text"
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