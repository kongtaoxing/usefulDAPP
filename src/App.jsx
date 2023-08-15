import React, { useEffect, useState, createContext, useContext } from "react";
import {ethers} from "ethers";
import { useContractWrite, useSignMessage } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "./App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import NFTImage from "./assets/muaverse.png";
import abi from "./utils/abi.json";

const sigContext = createContext();

const Mint = () => {
	const { signature, setSignature } = useContext(sigContext);
	const { data, isLoading, isSuccess, write } = useContractWrite({
		address: "0x4F9B2eafD5D4a5460b3B7b743595e5dE4eCA047E",
		abi: abi,
		functionName: 'call',
		// gasPrice: ethers.utils.parseUnits("0.01", "gwei"),
		value: ethers.utils.parseEther("0.005"),
		args: [signature]
	})
 
	return (
		<div className="dataContainer">
			<button onClick={() => write()} className="callButton">铸造</button>
			{isLoading && <div className="bio">铸造中</div>}
			{isSuccess && <a href={"https://bscscan.com/tx/" + data.hash} className="bio">铸造哈希：basescan.org</a>}
		</div>
	)
}

const App = () => {
	const [signature, setSignature] = useState("");

	/*
	 * This runs our function when the page loads.
	 * More technically, when the App component "mounts".
	 */
	useEffect(async () => {
		// 
	}, []);

	return (
		<div className="App">
			<div style={{ display: 'flex', justifyContent: 'flex-end', padding: 12, position: 'absolute', zIndex: 1, right: 0 }}>
        <ConnectButton />
      </div>
			<div className="mainContainer">
				<div className="dataContainer">
					<div className="header">
						muaverse批量铸造批量邀请
					</div>

					<div className="bio">
					输入铸造数量，然后点击"mint"铸造，喜欢的话欢迎关注我的推特，开源代码：
						<a href="https://github.com/kongtaoxing/usefulDAPP/tree/muaverse">usefulDAPP</a>
					</div>

					<sigContext.Provider value={{ signature, setSignature }}>
						<div className="grid-container">
							<span className="grid-item">
								请输入想要mint的数量：
							</span>
							<input type="text" value={signature} placeholder = '' style={{borderRadius:'4px',border:'none'}} onChange={a=>{setSignature(a.target.value)}} />
						</div>
						<Mint />
					</sigContext.Provider>

					<br></br>

					<img src={NFTImage} />

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