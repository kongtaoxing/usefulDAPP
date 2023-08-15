import './polyfills';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider, darkTheme, connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  imTokenWallet,
  trustWallet,
  tokenPocketWallet
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'

const { chains, publicClient } = configureChains(
  [bsc],
  [publicProvider()]
);

const projectId = '306f02c2b7fb0fd469b0fe0f03a5b83e';

const { wallets } = getDefaultWallets({
  appName: 'usefulDapp',
  projectId,
  chains,
});

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: '更多钱包',
    wallets: [
      imTokenWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
      tokenPocketWallet({ projectId, chains })
    ]
  }
])

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

ReactDOM.render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider coolMode chains={chains} theme={darkTheme()}>
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>,
  document.getElementById('root')
)
