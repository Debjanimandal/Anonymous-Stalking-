import { ContractAddress } from '@midnight-ntwrk/compact-runtime'
import * as pino from 'pino'

const logger = pino.pino({ level: 'info' })

export interface ContractService {
  submitReport: () => Promise<{ success: boolean; txHash?: string; error?: string }>
  getTotalReports: () => Promise<bigint>
}

/**
 * Create a contract service instance using the connected wallet API
 */
export function createContractService(
  connectedAPI: any,
  contractAddress: ContractAddress
): ContractService {
  
  return {
    /**
     * Submit an anonymous report by calling the increment circuit
     */
    async submitReport() {
      try {
        logger.info('Calling submitReport circuit...')
        
        // The increment circuit is called through the wallet's contract interaction API
        // This will generate the zero-knowledge proof and submit the transaction
        const result = await connectedAPI.callCircuit({
          contractAddress,
          circuit: 'increment',
          arguments: [],
        })
        
        logger.info('Circuit call result:', result)
        
        if (result && result.txHash) {
          return {
            success: true,
            txHash: result.txHash,
          }
        }
        
        return {
          success: true,
        }
      } catch (error: any) {
        logger.error('Submit report error:', error)
        return {
          success: false,
          error: error.message || 'Failed to submit report',
        }
      }
    },
    
    /**
     * Get the total number of reports from the contract's public ledger
     */
    async getTotalReports(): Promise<bigint> {
      try {
        logger.info('Fetching total reports from contract...')
        
        // Query the contract's public ledger state
        const state = await connectedAPI.getContractState(contractAddress)
        
        if (state && state.totalReports !== undefined) {
          return BigInt(state.totalReports)
        }
        
        // Fallback to 0 if state not available
        return 0n
      } catch (error: any) {
        logger.error('Get total reports error:', error)
        return 0n
      }
    },
  }
}
