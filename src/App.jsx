import React, { useEffect, useState } from "react";
import {ethers} from "ethers";
import "./App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import opNFT from "./assets/opNFT.gif";

const getEthereumObject = () => window.ethereum;

const abi = [
	"function call(uint256) external payable",
];

/*
 * This function returns the first linked account found.
 * If there is no account linked, it will return null.
 */
const findMetaMaskAccount = async () => {
	try {
		const ethereum = getEthereumObject();

		/*
		 * First make sure we have access to the Ethereum object.
		 */
		if (!ethereum) {
			console.error("Make sure you have Metamask!");
			return null;
		}

		console.log("We have the Ethereum object", ethereum);
		const accounts = await ethereum.request({
			method: "eth_accounts"
		});

		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log("Found an authorized account:", account);
			return account;
		} else {
			console.error("No authorized account found");
			return null;
		}
	} catch (error) {
		console.error(error);
		return null;
	}
};

const App = () => {
	const [currentAccount, setCurrentAccount] = useState("");
	const [value, setValue] = useState();
	const [hash, setHash] = useState("");

	const contractAddress = "0x09a402402612e529c29809197a78662db18cb038";

	const connectWallet = async () => {
		try {
			const ethereum = getEthereumObject();
			if (!ethereum) {
				alert("Get MetaMask!");
				return;
			}

			const accounts = await ethereum.request({
				method: "eth_requestAccounts",
			});

			console.log("Connected", accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.error(error);
		}
	};

	const _mint = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const callContract = new ethers.Contract(contractAddress, abi, signer);

				/*
				 * Execute the actual call from your smart contract
				 */
				const callTxn = await callContract.call(value, {
					value: ethers.utils.parseUnits("0.001", "ether")
				});
				console.log("Mining...", callTxn.hash);

				setHash(() => "https://optimistic.etherscan.io/tx/" + callTxn.hash);

				await callTxn.wait();
				console.log("Mined -- ", callTxn.hash);
				console.log("Minted successfully");
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	}

	/*
	 * This runs our function when the page loads.
	 * More technically, when the App component "mounts".
	 */
	useEffect(async () => {
		const account = await findMetaMaskAccount();
		if (account !== null) {
			setCurrentAccount(account);
		}
	}, []);

	return (
		<div className="App">
			<div className="mainContainer">
				<div className="dataContainer">
					<div className="header">
						mint.fun Op链纪念NFT铸造
					</div>

					<div className="bio">
						输入铸造数量，然后点击"mint"铸造，喜欢的话欢迎关注我的<a href="https://twitter.com/kongtaoxing">推特</a>，开源代码：
						<a href="https://github.com/kongtaoxing/usefulDAPP/tree/opMintFun">usefulDAPP</a>
					</div>

					{/*
					* If there is no currentAccount render this button
					*/}
					{!currentAccount && (
					<button className="callButton" onClick={connectWallet}>
						Connect Wallet
					</button>
					)}
					
					<div className="grid-container">
						<span className="grid-item">
              				请输入想要mint的数量：
            			</span>
						<input type="text" value={value} placeholder = '100' style={{borderRadius:'4px',border:'none'}} onChange={a=>{setValue(a.target.value)}} />
					</div>
					
					<button className="callButton" onClick={_mint}> 
						Mint 
					</button>

					{
						hash
						&&
						<a href={hash} className="bio">铸造哈希：https://optimistic.etherscan.io/</a>
					}

					<br></br>

					{/* <video src={baseNFT} autoPlay loop /> */}
					<img src={opNFT} />

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