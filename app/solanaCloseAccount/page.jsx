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
import { solanaSplTranslations as translations } from "@/consts/translation";

// add this to solve `Hydration failed` issue
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export default function SolanaCloseAccount() {

  const [tokenAccounts, setTokenAccounts] = useState([]);
  const [language, setLanguage] = useState('zh');

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  // 在组件加载时检测浏览器语言
  useEffect(() => {
    const browserLang = navigator.language.toLowerCase();
    setLanguage(browserLang.startsWith('zh') ? 'zh' : 'en');
  }, []);

  // 获取当前语言的翻译
  const t = translations[language];

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
                  // console.log("metadata catched:", metadata)
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
      
      alert(t.closeSuccess);
    } catch (error) {
      console.error(t.closeError, error);
      alert(`${t.closeError} ${error.message}`);
    }
  };

  const closeAllEmptyAccounts = async () => {
    try {
      const emptyAccounts = tokenAccounts.filter(
        account => Number(account.account.data.parsed.info.tokenAmount.uiAmountString) === 0
      );

      if (emptyAccounts.length === 0) {
        alert(t.noEmptyAccounts);
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
      
      alert(t.closeAllSuccess);
    } catch (error) {
      console.error(t.closeAllError, error);
      alert(`${t.closeAllError} ${error.message}`);
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
      <Header>{t.title}</Header>
      <div className="flex justify-center mt-8 mb-auto flex-col items-center">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="mb-4 px-4 py-2 rounded bg-gray-700 text-white"
        >
          <option value="en">English</option>
          <option value="zh">中文</option>
        </select>
        
        <WalletMultiButtonDynamic />
        {connection && publicKey && (
          <button
            onClick={closeAllEmptyAccounts}
            className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 rounded"
          >
            {t.closeAllBtn}
          </button>
        )}
        {
          tokenAccounts.length > 0
          &&
          <div className="flex flex-col items-center mt-4">
            <h2>{t.tokenAccounts}</h2>
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
                          <p><span className="font-bold">{t.contractAddress}:</span> {tokenAccount.account.data.parsed.info.mint}</p>
                          <p><span className="font-bold">{t.tokenName}:</span> {tokenAccount.metadata?.name || t.unknown}</p>
                          <p><span className="font-bold">{t.tokenSymbol}:</span> {tokenAccount.metadata?.symbol || t.unknown}</p>
                          {tokenAccount.metadata?.description && (
                            <p><span className="font-bold">{t.description}:</span> {tokenAccount.metadata.description}</p>
                          )}
                          <p><span className="font-bold">{t.tokenBalance}:</span> {
                            Number(tokenAccount.account.data.parsed.info.tokenAmount.uiAmountString)
                          } ({tokenAccount.account.data.parsed.info.tokenAmount.decimals} {t.decimals})</p>
                          <p><span className="font-bold">{t.solBalance}:</span> {
                            tokenAccount.account.lamports / LAMPORTS_PER_SOL
                          } SOL</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p><span className="font-bold">{t.contractAddress}:</span> {tokenAccount.account.data.parsed.info.mint}</p>
                        <p><span className="font-bold">{t.tokenName}:</span> {tokenAccount.metadata?.name || t.unknown}</p>
                        <p><span className="font-bold">{t.tokenSymbol}:</span> {tokenAccount.metadata?.symbol || t.unknown}</p>
                        {tokenAccount.metadata?.description && (
                          <p><span className="font-bold">{t.description}:</span> {tokenAccount.metadata.description}</p>
                        )}
                        <p><span className="font-bold">{t.tokenBalance}:</span> {
                          Number(tokenAccount.account.data.parsed.info.tokenAmount.uiAmountString)
                        } ({tokenAccount.account.data.parsed.info.tokenAmount.decimals} {t.decimals})</p>
                        <p><span className="font-bold">{t.solBalance}:</span> {
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
                        ? t.cannotClose
                        : t.closeAccount}
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
