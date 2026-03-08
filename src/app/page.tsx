'use client';
import { 
  Swap,
  SwapAmountInput,
  SwapButton,
  SwapMessage,
  SwapSettings,
  SwapSettingsSlippageDescription,
  SwapSettingsSlippageInput,
  SwapSettingsSlippageTitle,
  SwapToast,
  SwapToggleButton
} from '@coinbase/onchainkit/swap';
import { base } from 'wagmi/chains';
import { useAccount } from 'wagmi';
import LoginButton from '../components/LoginButton';
import SignupButton from '../components/SignupButton';

export default function Page() {
  const { address } = useAccount();

  // Define tokens for Base network
  const tokens = [
    {
      name: 'Ethereum',
      address: '0x4200000000000000000000000000000000000006' as const,
      symbol: 'ETH',
      decimals: 18,
      image: 'https://wallet-api-production.s3.amazonaws.com/uploads/tokens/eth_288.png',
      chainId: base.id,
    },
    {
      name: 'USD Coin',
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const,
      symbol: 'USDC',
      decimals: 6,
      image: 'https://d3r81g40yc8ejj.cloudfront.net/wallet/wais/44/2b/442b80bd16af0c0d9b22e03a16753823fe826e5bfd457292b55fa0ba8c1ba213ce.png',
      chainId: base.id,
    },
    {
      name: 'Tether USD',
      address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2' as const,
      symbol: 'USDT',
      decimals: 6,
      image: 'https://d3r81g40yc8ejj.cloudfront.net/wallet/wais/d0/d0/cd08d0cd62d37e356a3d2c770ec82736ae884623c9bd081cd2b2ad0e7a1b7b2e5.png',
      chainId: base.id,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Swap App
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <SignupButton />
          {!address && <LoginButton />}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
        <div className="w-full max-w-md">
          {address ? (
            <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-800">
              <Swap
                config={{
                  maxSlippage: 1, // 1% slippage
                }}
                title="Swap Tokens"
                className="w-full"
                onSuccess={(receipt) => {
                  console.log('Swap successful:', receipt);
                }}
                onError={(error) => {
                  console.error('Swap error:', error);
                }}
              >
                <SwapSettings>
                  <SwapSettingsSlippageTitle>Max. slippage</SwapSettingsSlippageTitle>
                  <SwapSettingsSlippageDescription>
                    Your swap will revert if the prices change by more than the selected percentage.
                  </SwapSettingsSlippageDescription>
                  <SwapSettingsSlippageInput />
                </SwapSettings>
                <SwapAmountInput
                  label="Sell"
                  swappableTokens={tokens}
                  token={tokens[0]} // ETH
                  type="from"
                />
                <SwapToggleButton />
                <SwapAmountInput
                  label="Buy"
                  swappableTokens={tokens}
                  token={tokens[1]} // USDC
                  type="to"
                />
                <SwapButton />
                <SwapMessage />
                <SwapToast />
              </Swap>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
                <p className="text-gray-400">Connect your wallet to start swapping tokens on Base</p>
              </div>
              <LoginButton />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
