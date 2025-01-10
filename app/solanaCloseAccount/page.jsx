"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { createCloseAccountInstruction } from "@solana/spl-token";
import { Transaction } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { PublicKey } from "@solana/web3.js";

// add this to solve `Hydration failed` issue
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export default function SolanaCloseAccount() {

  const [tokenAccounts, setTokenAccounts] = useState([]);

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  useEffect(() => {
    const getTokenAccounts = async () => {
      if (connection && publicKey) {
        const raw_tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        });
  
        // 创建Metaplex实例并优化获取metadata的方式
        const metaplex = new Metaplex(connection);
        
        const accountsWithMetadata = await Promise.all(
          raw_tokenAccounts.value.map(async (account) => {
            try {
              const mintAddress = new PublicKey(account.account.data.parsed.info.mint);
              let metadata;
              try {
                // 修复: 移除.run()调用
                metadata = await metaplex
                  .nfts()
                  .findByMint({ mintAddress });
                  console.log("metadata catched:", metadata)
              } catch (metadataError) {
                console.log(`获取metadata失败: ${metadataError.message}`);
                // 如果获取metadata失败，返回基础token信息
                return {
                  ...account,
                  metadata: {
                    name: account.account.data.parsed.info.mint.slice(0, 8) + '...',
                    symbol: 'N/A',
                    image: null,
                    uri: null,
                    description: null,
                    attributes: []
                  }
                };
              }
              
              // 确保metadata的各个字段都存在，使用可选链和默认值
              return {
                ...account,
                metadata: {
                  name: metadata?.name || 'Unnamed Token',
                  symbol: metadata?.symbol || 'N/A',
                  image: metadata?.json?.image || null,
                  uri: metadata?.uri || null,
                  description: metadata?.json?.description || null,
                  attributes: metadata?.json?.attributes || []
                }
              };
            } catch (error) {
              console.error(`处理Token账户数据时出错: ${error.message}`);
              return {
                ...account,
                metadata: {
                  name: '处理出错',
                  symbol: 'ERROR',
                  image: null,
                  uri: null,
                  description: '无法加载Token信息',
                  attributes: []
                }
              };
            }
          })
        );
  
        setTokenAccounts(accountsWithMetadata);
      }
      if (!publicKey) {
        setTokenAccounts([]);
      }
    };

    getTokenAccounts();
  }, [connection, publicKey]);

  const closeAccount = async (tokenAccountPubkey) => {
    try {
      const transaction = new Transaction();
      
      const instruction = createCloseAccountInstruction(
        tokenAccountPubkey,    // 要关闭的账户
        publicKey,             // 接收剩余 SOL 的账户
        publicKey,             // 账户所有者
      );
      
      transaction.add(instruction);
      
      const signature = await sendTransaction(transaction, connection);
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        ...latestBlockhash
      });
      
      await refreshAccounts();
      
      alert("Account closed successfully!");
    } catch (error) {
      console.error("Error closing account:", error);
      alert(`Error closing account: ${error.message}`);
    }
  };

  const closeAllEmptyAccounts = async () => {
    try {
      const emptyAccounts = tokenAccounts.filter(
        account => Number(account.account.data.parsed.info.tokenAmount.uiAmountString) === 0
      );

      if (emptyAccounts.length === 0) {
        alert("No empty accounts to close!");
        return;
      }

      const transaction = new Transaction();
      
      emptyAccounts.forEach(account => {
        const instruction = createCloseAccountInstruction(
          account.pubkey,
          publicKey,
          publicKey,
        );
        transaction.add(instruction);
      });
      
      const signature = await sendTransaction(transaction, connection);
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        ...latestBlockhash
      });
      
      await refreshAccounts();
      
      alert("All empty accounts closed successfully!");
    } catch (error) {
      console.error("Error closing accounts:", error);
      alert(`Error closing accounts: ${error.message}`);
    }
  };

  const refreshAccounts = async () => {
    const raw_tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
    });
    
    // 重新获取带metadata的账户信息
    const metaplex = new Metaplex(connection);
    const updatedAccountsWithMetadata = await Promise.all(
      raw_tokenAccounts.value.map(async (account) => {
        try {
          const mintAddress = new PublicKey(account.account.data.parsed.info.mint);
          let metadata;
          try {
            metadata = await metaplex
              .nfts()
              .findByMint({ mintAddress })
              .run();
          } catch (metadataError) {
            console.log(`获取metadata失败: ${metadataError.message}`);
            // 如果获取metadata失败，返回基础token信息
            return {
              ...account,
              metadata: {
                name: account.account.data.parsed.info.mint.slice(0, 8) + '...',
                symbol: 'N/A',
                image: null,
                uri: null,
                description: null,
                attributes: []
              }
            };
          }
          
          // 确保metadata的各个字段都存在，使用可选链和默认值
          return {
            ...account,
            metadata: {
              name: metadata?.name || 'Unnamed Token',
              symbol: metadata?.symbol || 'N/A',
              image: metadata?.json?.image || null,
              uri: metadata?.uri || null,
              description: metadata?.json?.description || null,
              attributes: metadata?.json?.attributes || []
            }
          };
        } catch (error) {
          console.error(`处理Token账户数据时出错: ${error.message}`);
          return {
            ...account,
            metadata: {
              name: '处理出错',
              symbol: 'ERROR',
              image: null,
              uri: null,
              description: '无法加载Token信息',
              attributes: []
            }
          };
        }
      })
    );
    
    setTokenAccounts(updatedAccountsWithMetadata);
  };

	return (
    <div className="min-h-screen text-center text-white flex flex-col justify-between">
      <Header>solana关闭空Token账户</Header>
      <div className="flex justify-center mt-8 mb-auto flex-col items-center">
        <WalletMultiButtonDynamic />
        {connection && publicKey && (
          <button
            onClick={closeAllEmptyAccounts}
            className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 rounded"
          >
            Close All Empty Accounts
          </button>
        )}
        {
          tokenAccounts.length > 0
          &&
          <div className="flex flex-col items-center mt-4">
            <h2>Token Accounts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tokenAccounts.map((tokenAccount) => (
                <div key={tokenAccount.pubkey.toBase58()} className="border p-4 m-2 rounded-lg max-w-lg w-full overflow-x-auto">
                  <div className="text-left whitespace-nowrap">
                    {tokenAccount.metadata?.image ? (
                      <div className="flex gap-4">
                        <img 
                          src={tokenAccount.metadata.image} 
                          alt={tokenAccount.metadata.name || "Token Image"} 
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div>
                          <p><span className="font-bold">Contract Address:</span> {tokenAccount.account.data.parsed.info.mint}</p>
                          <p><span className="font-bold">Token Name:</span> {tokenAccount.metadata?.name || "Unknown"}</p>
                          <p><span className="font-bold">Token Symbol:</span> {tokenAccount.metadata?.symbol || "Unknown"}</p>
                          {tokenAccount.metadata?.description && (
                            <p><span className="font-bold">Description:</span> {tokenAccount.metadata.description}</p>
                          )}
                          <p><span className="font-bold">Token Balance:</span> {
                            Number(tokenAccount.account.data.parsed.info.tokenAmount.uiAmountString)
                          } ({tokenAccount.account.data.parsed.info.tokenAmount.decimals} decimals)</p>
                          <p><span className="font-bold">SOL Balance:</span> {
                            tokenAccount.account.lamports / LAMPORTS_PER_SOL
                          } SOL</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p><span className="font-bold">Contract Address:</span> {tokenAccount.account.data.parsed.info.mint}</p>
                        <p><span className="font-bold">Token Name:</span> {tokenAccount.metadata?.name || "Unknown"}</p>
                        <p><span className="font-bold">Token Symbol:</span> {tokenAccount.metadata?.symbol || "Unknown"}</p>
                        {tokenAccount.metadata?.description && (
                          <p><span className="font-bold">Description:</span> {tokenAccount.metadata.description}</p>
                        )}
                        <p><span className="font-bold">Token Balance:</span> {
                          Number(tokenAccount.account.data.parsed.info.tokenAmount.uiAmountString)
                        } ({tokenAccount.account.data.parsed.info.tokenAmount.decimals} decimals)</p>
                        <p><span className="font-bold">SOL Balance:</span> {
                          tokenAccount.account.lamports / LAMPORTS_PER_SOL
                        } SOL</p>
                      </>
                    )}
                    <button 
                      onClick={() => closeAccount(tokenAccount.pubkey)}
                      disabled={Number(tokenAccount.account.data.parsed.info.tokenAmount.uiAmountString) > 0}
                      className={`mt-4 px-4 py-2 rounded ${
                        Number(tokenAccount.account.data.parsed.info.tokenAmount.uiAmountString) > 0
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      {Number(tokenAccount.account.data.parsed.info.tokenAmount.uiAmountString) > 0
                        ? "Cannot close - Account has balance"
                        : "Close Account"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
      </div>
      <Footer />
    </div>
	);
}
