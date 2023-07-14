import React, { useEffect, useState } from "react";
import {ethers} from "ethers";
import "./App.css";
import twitterLogo from "./assets/twitter-logo.svg"

const getEthereumObject = () => window.ethereum;

const abi = [
	"function mint(bytes)  external returns (uint256)",
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
	const [signature, setSignature] = useState("");

	const contractAddress = "0x1FC10ef15E041C5D3C54042e52EB0C54CB9b710c";

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

	const _sign = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const message = "all your base are belong to you.";
				const messageBytes = ethers.utils.toUtf8Bytes(message);
				const sig = await signer.signMessage(messageBytes);
				setSignature(() => sig);
			}
		}
		catch (e) {
			console.log(e);
		}
	}

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
				const callTxn = await callContract.mint(signature);
				console.log("Mining...", callTxn.hash);

				await callTxn.wait();
				console.log("Mined -- ", callTxn.hash);

				count = await callContract.getOwner();
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
						一系列实用脚本前端版
					</div>

					<br></br>

					<a href="https://useful-dapp-git-basemainnet-kongtaoxing.vercel.app/" className="bio">
						1. base主网纪念NFT铸造
					</a>

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