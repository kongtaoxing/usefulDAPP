import React, { useEffect, useState } from "react";
import { Contract, ethers } from "ethers";
import "./App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import scrollNFT from "./assets/scroll.gif";
import { abi, bytecode } from "./utils/abi";

const App = () => {

	const [account, setAccount] = useState();
	const [hash, setHash] = useState('');
	const [ca, setCa] = useState('');
	const [switched, setSwitched] = useState(false);
	const [chainId, setChainId] = useState('');

	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert("Get MetaMask -> https://metamask.io/");
				return;
			}

			// Fancy method to request access to account.
			const accounts = await ethereum.request({
				method: "eth_requestAccounts"
			});

			// Boom! This should print out public address once we authorize Metamask.
			console.log("Connected", accounts[0]);
			setAccount(accounts[0]);
		} catch (error) {
			console.log(error)
		}
	}

	const switchNetwork = async () => {
		if (window.ethereum) {
			try {
				// Try to switch to the Mumbai testnet
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{
						chainId: '0x82750'
					}], // Check networks.js for hexadecimal network ids
				});
			} catch (error) {
				// This error code means that the chain we want has not been added to MetaMask
				// In this case we ask the user to add it to their MetaMask
				if (error.code === 4902) {
					try {
						await window.ethereum.request({
							method: 'wallet_addEthereumChain',
							params: [{
								chainId: '0x82750',
								chainName: 'Scroll Mainnet',
								rpcUrls: ['https://rpc.scroll.io'],
								nativeCurrency: {
									name: "Ether",
									symbol: "ETH",
									decimals: 18
								},
								blockExplorerUrls: ["https://scrollscan.com/"]
							}, ],
						});
						setSwitched(() => true);
					} catch (error) {
						console.log(error);
					}
				}
				console.log(error);
			}
		} else {
			// If window.ethereum is not found then MetaMask is not installed
			alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
		}
	}


	const deploy = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provideer = new ethers.providers.Web3Provider(ethereum);
				const signer = provideer.getSigner();
				const factory = new ethers.ContractFactory(abi, bytecode, signer);
				const deploy = await factory.deploy({
					gasPrice: ethers.utils.parseUnits('0.55', 'gwei'),
				});
				setHash(() => deploy.hash);
				await deploy.deployed();
				setCa(() => deploy.address);

			}
			else {
				alert("请下载Metamask钱包！");
			}
		}
		catch (e) {
			console.log(e);
		}
	}

	useEffect(() => {
		const getChainId = async () => {
			const id = await ethereum.request({method: 'eth_chainId'});
			setChainId(() => id);
		}
		getChainId();
		console.log('Chain ID:', chainId);
		console.log(account, chainId);
	}, [chainId, hash, ca])

	return (
		<div className="App">
			<div className="mainContainer">
				<div className="dataContainer">
					<div className="header">
						scroll主网部署最简单合约
					</div>

					<div className="bio">
						点击部署按钮即可部署最简单合约，喜欢的话欢迎关注我的<a href="https://twitter.com/kongtaoxing">推特</a>，开源代码：
						<a href="https://github.com/kongtaoxing/usefulDAPP/tree/scrollCA">usefulDAPP</a>
						，在
						<a href="https://scroll.io/developer-nft/check-eligibility">此处</a>
						检查是否具有空投资格
					</div>

					{
						!account 
						&& 
						<button className="callButton" onClick={connectWallet}>
							链接钱包
						</button>
					}

					{
						account
						&&
						chainId != "0x82750"
						&&
						!switched
						&&
						<button className="callButton" onClick={switchNetwork}>
							切换到scroll主网
						</button>
					}

					<button className="callButton" onClick={deploy}>
						部署
					</button>

					{hash && !ca && <p className="bio">合约部署哈希：<a href={"https://scrollscan.com/tx/" + hash} >{hash}</a></p>}
					{ca && <p className="bio">合约已部署到：<a href={"https://scrollscan.com/address/" + ca} >{ca}</a></p>}

					<br></br>

					<img alt="scroll NFT" src={scrollNFT} />

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