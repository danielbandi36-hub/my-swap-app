'use client';
import { useState, useEffect } from 'react';
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from '@coinbase/onchainkit/transaction';
import type {
  TransactionError,
  TransactionResponse,
} from '@coinbase/onchainkit/transaction';
import type { Address, ContractFunctionParameters } from 'viem';
import { parseUnits, } from 'viem';
import { BASE_SEPOLIA_CHAIN_ID, SWAP_ROUTER_ADDRESS } from '../constants';

// Common tokens on Base Sepolia
const TOKENS = [
  {
    symbol: 'ETH',
    address: '0x4200000000000000000000000000000000000006' as Address,
    decimals: 18,
  },
  {
    symbol: 'USDC',
    address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as Address,
    decimals: 6,
  },
  {
    symbol: 'WETH',
    address: '0x4200000000000000000000000000000000000006' as Address,
    decimals: 18,
  },
];

// Simple swap router ABI (simplified for demo)
const SWAP_ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'recipient', type: 'address' },
          { name: 'deadline', type: 'uint256' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMinimum', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' },
        ],
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'exactInputSingle',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

interface Token {
  symbol: string;
  address: Address;
  decimals: number;
}

export default function Swap({ address }: { address: Address }) {
  const [fromToken, setFromToken] = useState<Token>(TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');

  // Mock price calculation (in a real app, you'd use a price oracle or DEX quote)
  const calculateSwap = (amount: string, fromToken: Token, toToken: Token) => {
    if (!amount || isNaN(Number(amount))) return '';

    // Simple mock calculation - in reality, you'd get a quote from the DEX
    const mockRate = fromToken.symbol === 'ETH' && toToken.symbol === 'USDC' ? 2000 :
                     fromToken.symbol === 'USDC' && toToken.symbol === 'ETH' ? 0.0005 : 1;

    const result = Number(amount) * mockRate;
    return result.toFixed(toToken.decimals);
  };

  useEffect(() => {
    if (fromAmount) {
      const calculatedAmount = calculateSwap(fromAmount, fromToken, toToken);
      setToAmount(calculatedAmount);
    }
  }, [fromAmount, fromToken, toToken]);

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const prepareSwapTransaction = () => {
    if (!fromAmount || !toAmount) return null;

    const amountIn = parseUnits(fromAmount, fromToken.decimals);
    const amountOutMin = parseUnits(
      (Number(toAmount) * (1 - Number(slippage) / 100)).toString(),
      toToken.decimals
    );

    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

    return [
      {
        address: SWAP_ROUTER_ADDRESS,
        abi: SWAP_ROUTER_ABI,
        functionName: 'exactInputSingle',
        args: [{
          tokenIn: fromToken.address,
          tokenOut: toToken.address,
          fee: 3000, // 0.3% fee tier
          recipient: address,
          deadline,
          amountIn,
          amountOutMinimum: amountOutMin,
          sqrtPriceLimitX96: 0, // No price limit
        }],
        value: fromToken.symbol === 'ETH' ? amountIn : 0n,
      },
    ] as unknown as ContractFunctionParameters[];
  };

  const contracts = prepareSwapTransaction();

  const handleError = (err: TransactionError) => {
    console.error('Swap error:', err);
  };

  const handleSuccess = (response: TransactionResponse) => {
    console.log('Swap successful', response);
    // Reset form
    setFromAmount('');
    setToAmount('');
  };

  if (!contracts) {
    return (
      <div className="flex w-[450px] flex-col gap-4">
        <h2 className="text-xl font-bold text-center">Token Swap</h2>
        <div className="text-center text-gray-500">
          Enter an amount to swap
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-[450px] flex-col gap-4">
      <h2 className="text-xl font-bold text-center">Token Swap</h2>

      {/* From Token */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium">From</label>
          <select
            value={fromToken.symbol}
            onChange={(e) => {
              const token = TOKENS.find(t => t.symbol === e.target.value);
              if (token) setFromToken(token);
            }}
            className="text-sm bg-white border rounded px-2 py-1"
          >
            {TOKENS.map(token => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
        <input
          type="number"
          placeholder="0.0"
          value={fromAmount}
          onChange={(e) => setFromAmount(e.target.value)}
          className="w-full text-2xl bg-transparent border-none outline-none"
        />
      </div>

      {/* Swap Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSwapTokens}
          className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600"
        >
          ⇅
        </button>
      </div>

      {/* To Token */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium">To</label>
          <select
            value={toToken.symbol}
            onChange={(e) => {
              const token = TOKENS.find(t => t.symbol === e.target.value);
              if (token) setToToken(token);
            }}
            className="text-sm bg-white border rounded px-2 py-1"
          >
            {TOKENS.map(token => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
        <input
          type="number"
          placeholder="0.0"
          value={toAmount}
          readOnly={true}
          className="w-full text-2xl bg-transparent border-none outline-none"
        />
      </div>

      {/* Slippage Settings */}
      <div className="flex items-center gap-2">
        <label className="text-sm">Slippage:</label>
        <input
          type="number"
          value={slippage}
          onChange={(e) => setSlippage(e.target.value)}
          className="w-16 text-sm border rounded px-2 py-1"
          step="0.1"
          min="0.1"
          max="5"
        />
        <span className="text-sm">%</span>
      </div>

      {/* Transaction */}
      <Transaction
        contracts={contracts}
        className="w-[450px]"
        chainId={BASE_SEPOLIA_CHAIN_ID}
        onError={handleError}
        onSuccess={handleSuccess}
      >
        <TransactionButton
          className="mt-0 mr-auto ml-auto w-[450px] max-w-full text-[white] bg-blue-600 hover:bg-blue-700"
          disabled={!fromAmount || !toAmount}
          text="Swap Tokens"
        />
        <TransactionStatus>
          <TransactionStatusLabel />
          <TransactionStatusAction />
        </TransactionStatus>
      </Transaction>
    </div>
  );
}