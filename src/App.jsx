import React, { useEffect, useState, createContext, useContext } from "react";
import {ethers} from "ethers";
import { useContractWrite, useSignMessage } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "./App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import baseNFT from "./assets/baseNFT.mp4";
import abi from "./utils/abi.json";

const sigContext = createContext();

const Sign = () => {
	const { signature, setSignature } = useContext(sigContext);
	const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
		message: 'all your base are belong to you.',
	})
	
	useEffect(() => {
    if (isSuccess) {
      setSignature(data);
    }
  }, [isSuccess, data, setSignature]);

	return (
		<div className="dataContainer">
			<button disabled={isLoading} className="callButton" onClick={() => signMessage()}>
				签名
			</button>
			{isSuccess && <div className="bio">Signature: {data}</div>}
			{isError && <div className="bio">Error signing message</div>}
		</div>
	)
}

const Mint = () => {
	const { signature, setSignature } = useContext(sigContext);
	const { data, isLoading, isSuccess, write } = useContractWrite({
		address: "0x1FC10ef15E041C5D3C54042e52EB0C54CB9b710c",
		abi: abi,
		functionName: 'mint',
		gasPrice: ethers.utils.parseUnits("0.01", "gwei"),
		args: [signature]
	})
 
	return (
		<div className="dataContainer">
			<button onClick={() => write()} className="callButton">铸造</button>
			{isLoading && <div className="bio">铸造中</div>}
			{isSuccess && <a href={"https://basescan.org/tx/" + data.hash} className="bio">铸造哈希：basescan.org</a>}
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
						base主网纪念NFT铸造
					</div>

					<div className="bio">
						首先点击"签名"获取NFT铸造签名，然后点击"mint"铸造，喜欢的话欢迎关注我的推特，开源代码：
						<a href="https://github.com/kongtaoxing/usefulDAPP/tree/baseMainnet">usefulDAPP</a>
					</div>

					<sigContext.Provider value={{ signature, setSignature }}>
						<Sign />
						<Mint />
					</sigContext.Provider>

					<br></br>

					<video src={baseNFT} autoPlay loop />

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