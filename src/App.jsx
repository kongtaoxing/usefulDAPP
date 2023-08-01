import React, { useEffect, useState } from "react";
// import { ethers } from "ethers";
import {
	connect,
	disconnect,
  } from "get-starknet";
import { constants, uint256, stark, Contract } from "starknet";
import "./App.css";
import etherAbi from "./utils/ether.json";
import caAbi from "./utils/ca.json";
import twitterLogo from "./assets/twitter-logo.svg";
import warNFT from "./assets/starwar.png";

const App = () => {
	const [currentAccount, setCurrentAccount] = useState("");
	const [account, setAccount]= useState(null);
	const [chain, setChain] = useState("");
	const [value, setValue] = useState();
	const [hash, setHash] = useState("");

	const etherContract = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
	const contractAddress = "0x17bcbb8fca1ca93ed677a88609682106e2a1104bbffb7749a25afe837a77f21";

	const connectWallet = async () => {
		const windowStarknet = await connect({
		  modalMode: "alwaysAsk"
		})
		await windowStarknet?.enable({ starknetVersion: "v4" })
		return windowStarknet;
	}

	const handleConnectClick = async () => {
		try {
		  const wallet = await connectWallet()
		  if (wallet?.account) {
			setAccount(() => wallet.account);
			setCurrentAccount(() => wallet.account.address);
			let chainName = await chainId(wallet?.provider.chainId);
			setChain(() => chainName);
			// setConnected(connected => {return !!wallet?.isConnected})
			console.log('current account:', currentAccount);
			if (chainName != "mainnet-alpha") {
				console.log("切换到主网");
			}
		  }
		}
		catch(e) {
		  console.log(e.message);
		  if (e.message.includes('User abort')) { /*ignore*/ }
		}
	  }

	async function chainId(id) {
		if (id === constants.StarknetChainId.MAINNET) {
		  return "mainnet-alpha"
		} else if (id === constants.StarknetChainId.TESTNET) {
		  return "goerli-alpha"
		} else {
		  return "localhost"
		}
	}

	const _mint = async () => {
		if (currentAccount) {
			const callEther = new Contract(etherAbi, etherContract, account);
			const callContract = new Contract(caAbi, contractAddress, account);

			/*
				* Execute the actual call from your smart contract
				*/
			const approve = [{
				contractAddress: etherContract,
				entrypoint: "approve",
				calldata: [contractAddress, String(500000000000000 * value), "0"]
			}];
			const call = {
				contractAddress: contractAddress,
				entrypoint: "mint_a",
				calldata: ["0x05f3f4C2dE5e1091ecf810832110D32d4F449c071790B57d9C807Bb670f47572"]
			};
			const call_string = JSON.stringify(call) + ',';
			const call_raw = '[' + call_string.repeat(value) + ']';
			const fee = [
				{
					contractAddress: etherContract,
					entrypoint: "transfer",
					calldata: ["0x05f3f4C2dE5e1091ecf810832110D32d4F449c071790B57d9C807Bb670f47572", value ? "500000000000000" : "0", "0"]
				}
			]
			const callData = approve.concat(eval(call_raw)).concat(fee);
			const callTxn = await account.execute(
				callData
			)
			console.log("Mining...", callTxn.transaction_hash);

			setHash(() => "https://starkscan.co/tx/" + callTxn.hash);

			await callTxn.wait();
			console.log("Mined -- ", callTxn.hash);
			console.log("Minted successfully");
		} else {
			console.log("Ethereum object doesn't exist!");
		}
	}

	/*
	 * This runs our function when the page loads.
	 * More technically, when the App component "mounts".
	 */
	useEffect(async () => {
		// const account = await findMetaMaskAccount();
		// if (account !== null) {
		// 	setCurrentAccount(account);
		// }
	}, []);

	return (
		<div className="App">
			<div className="mainContainer">
				<div className="dataContainer">
					<div className="header">
						Starkwars NFT铸造
					</div>

					<div className="bio">
						输入铸造数量(最多5个)，然后点击"mint"铸造，喜欢的话欢迎关注我的<a href="https://twitter.com/kongtaoxing">推特</a>，开源代码：
						<a href="https://github.com/kongtaoxing/usefulDAPP/tree/starkwars">usefulDAPP</a>
					</div>

					{/*
					* If there is no currentAccount render this button
					*/}
					{!currentAccount && (
					<button className="callButton" onClick={handleConnectClick}>
						Connect Wallet
					</button>
					)}
					
					<div className="grid-container">
						<span className="grid-item">
              				请输入想要mint的数量：
            			</span>
						<input type="text" value={value} placeholder = '' style={{borderRadius:'4px',border:'none'}} onChange={a=>{setValue(a.target.value)}} />
					</div>
					
					<button className="callButton" onClick={_mint}> 
						Mint
					</button>

					{
						hash
						&&
						<a href={hash} className="bio">铸造哈希：https://starkscan.co/tx/</a>
					}

					<br></br>

					{/* <video src={baseNFT} autoPlay loop /> */}
					<img src={warNFT} />

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