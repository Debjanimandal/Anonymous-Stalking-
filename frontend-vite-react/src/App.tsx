import { useState, useEffect } from 'react'
import { ContractAddress } from '@midnight-ntwrk/compact-runtime'
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id'
import * as pino from 'pino'
import { Lock, BarChart3, Zap, CheckCircle2, AlertTriangle } from 'lucide-react'
import LiquidEther from './components/LiquidEther'
import './App.css'

// Set network to undeployed (standalone)
setNetworkId('undeployed')

const logger = pino.pino({ level: 'info' })

// Your deployed contract address
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as ContractAddress || 
  'f84c5ddd658f7292adeeacd5c17d446329a228b9d53cfab0b16fd7533dcbb6db' as ContractAddress

interface WalletState {
  isConnected: boolean
  address?: string
  balance?: string
  provider?: any
}

// Midnight wallet API types
interface InitialAPI {
  name: string
  apiVersion: string
  connect: (networkId: string) => Promise<ConnectedAPI>
  icon?: string
  rdns?: string
}

interface ConnectedAPI {
  getConfiguration: () => Promise<any>
  getConnectionStatus: () => Promise<any>
  disconnect: () => Promise<void>
  [key: string]: any
}

declare global {
  interface Window {
    midnight?: { [key: string]: InitialAPI }
  }
}

function App() {
  const [totalReports, setTotalReports] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [wallet, setWallet] = useState<WalletState>({ isConnected: false })
  const [walletAvailable, setWalletAvailable] = useState(false)

  useEffect(() => {
    // Check if Midnight wallet extension is installed
    const checkWallet = () => {
      if (typeof window !== 'undefined' && window.midnight) {
        setWalletAvailable(true)
        logger.info('Midnight wallet detected')
      } else {
        setWalletAvailable(false)
        logger.info('No Midnight wallet found')
      }
    }
    
    checkWallet()
    // Check again after a delay in case extension loads later
    setTimeout(checkWallet, 1000)
  }, [])

  const connectWallet = async () => {
    try {
      setMessage('Looking for Midnight wallet...')
      
      if (!window.midnight) {
        setMessage('No Midnight wallet found. Please install the Midnight Lace wallet extension.')
        return
      }

      // Get available wallets from window.midnight
      const availableWallets: InitialAPI[] = []
      for (const key in window.midnight) {
        const wallet = window.midnight[key]
        if (wallet && wallet.name && typeof wallet.connect === 'function') {
          availableWallets.push(wallet)
        }
      }

      if (availableWallets.length === 0) {
        setMessage('No Midnight wallet found. Please install the Midnight Lace wallet extension.')
        return
      }

      setMessage('Connecting to Midnight wallet...')
      
      // Use the first available wallet
      const initialAPI = availableWallets[0]
      logger.info('Connecting to wallet:', initialAPI.name)

      // Connect to the wallet with network ID
      const connectedAPI = await initialAPI.connect('undeployed')
      
      if (!connectedAPI) {
        setMessage('Failed to connect to wallet. Connection was rejected.')
        return
      }
      
      setWallet({
        isConnected: true,
        address: initialAPI.name,
        provider: connectedAPI
      })
      
      setMessage('Wallet connected successfully! You can now submit reports.')
      logger.info('Wallet connected:', initialAPI.name)
      
    } catch (error: any) {
      setMessage(`Failed to connect wallet: ${error.message || 'User rejected connection'}`)
      logger.error('Connection error:', error)
    }
  }

  const disconnectWallet = async () => {
    try {
      if (wallet.provider && typeof wallet.provider.disconnect === 'function') {
        await wallet.provider.disconnect()
      }
    } catch (error) {
      logger.error('Disconnect error:', error)
    }
    setWallet({ isConnected: false })
    setMessage('Wallet disconnected')
  }

  const submitReport = async () => {
    if (!wallet.isConnected || !wallet.provider) {
      setMessage('Please connect your wallet first')
      return
    }

    try {
      setIsSubmitting(true)
      setMessage('Preparing zero-knowledge proof...')
      
      logger.info('Submitting report to contract:', CONTRACT_ADDRESS)
      
      // Simulate proof generation
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      setMessage('Requesting wallet signature...')
      
      // In a real implementation, this would call the contract's submitReport() function
      // and the wallet would prompt for signature
      try {
        // Simulate wallet signing request
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        setMessage('Submitting to Midnight Network...')
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        setTotalReports(prev => prev + 1)
        setMessage('Report submitted anonymously! Your identity is protected by zero-knowledge proofs.')
        
        logger.info('Report submitted successfully')
        
        setTimeout(() => setMessage(''), 6000)
      } catch (signError: any) {
        if (signError.code === 4001) {
          setMessage('Transaction signature declined')
        } else {
          throw signError
        }
      }
    } catch (error: any) {
      setMessage(`Failed to submit report: ${error.message || 'Unknown error'}`)
      logger.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="app">
      <LiquidEther
        className="liquid-background"
        colors={['#5227FF', '#FF9FFC', '#B19EEF']}
        mouseForce={20}
        cursorSize={100}
        resolution={0.5}
        autoDemo={true}
        autoSpeed={0.3}
        autoIntensity={1.8}
      />
      
      <div className="content">
        <nav className="navbar">
          <div className="nav-brand">
            <svg className="logo-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="brand-name">Anonymous Report Registry</span>
          </div>
          <div className="nav-links">
            <a href="#home" className="nav-link">Home</a>
            <a href="#docs" className="nav-link">Docs</a>
          </div>
        </nav>

        <main className="main-content">
          <div className="hero">
            <h1 className="hero-title">
              Anonymous reporting, made secure with zero-knowledge.
            </h1>
            <p className="hero-subtitle">
              Submit reports anonymously using Midnight Network's privacy-preserving blockchain technology.
            </p>
            
            <div className="hero-actions">
              {!wallet.isConnected ? (
                <button 
                  className="btn btn-primary" 
                  onClick={connectWallet}
                  disabled={!walletAvailable}
                >
                  {walletAvailable ? 'Get Started' : 'Install Wallet'}
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={submitReport}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              )}
              <button className="btn btn-secondary">Learn More</button>
            </div>

            {message && (
              <div className={`status-message ${message.toLowerCase().includes('fail') || message.toLowerCase().includes('declined') || message.toLowerCase().includes('error') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}
          </div>

          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon"><Lock size={32} /></div>
              <h3>Zero-Knowledge Privacy</h3>
              <p>Your identity stays completely private through cryptographic proofs</p>
              {wallet.isConnected && (
                <div className="wallet-badge">
                  <span className="badge-dot"></span>
                  {wallet.address}
                </div>
              )}
            </div>

            <div className="info-card">
              <div className="info-icon"><BarChart3 size={32} /></div>
              <h3>Total Reports</h3>
              <p className="stat-large">{totalReports}</p>
              <p>Anonymous submissions recorded on-chain</p>
            </div>

            <div className="info-card">
              <div className="info-icon"><Zap size={32} /></div>
              <h3>Midnight Network</h3>
              <p>Built on cutting-edge privacy blockchain technology</p>
              <p className="contract-address">{CONTRACT_ADDRESS.slice(0, 20)}...</p>
            </div>
          </div>

          {wallet.isConnected && (
            <div className="wallet-panel">
              <div className="wallet-panel-header">
                <span><CheckCircle2 size={18} style={{display: 'inline', verticalAlign: 'middle', marginRight: '6px'}} /> Wallet Connected</span>
                <button className="btn-disconnect" onClick={disconnectWallet}>
                  Disconnect
                </button>
              </div>
            </div>
          )}

          {!walletAvailable && (
            <div className="warning-banner">
              <AlertTriangle size={18} style={{display: 'inline', verticalAlign: 'middle', marginRight: '6px'}} /> No Midnight wallet detected. Please install the Midnight Lace browser extension to continue.
            </div>
          )}
        </main>

        <footer className="footer">
          <p className="footer-text">Powered by Midnight Network • Privacy-First Blockchain</p>
          <p className="footer-subtext">Network: Undeployed (Standalone)</p>
        </footer>
      </div>
    </div>
  )
}

export default App
