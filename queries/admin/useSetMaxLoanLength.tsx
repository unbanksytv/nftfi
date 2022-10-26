import { useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAccount, useContractWrite, useNetwork, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import toast from 'react-hot-toast'
import { txConfirming, txError, txSuccess } from '~/components/TxToast'
import { useTxContext } from '~/contexts'
import { chainConfig } from '~/lib/constants'
import { formatMaxLoanLength } from '~/utils'

interface ISetMaxLoanLength {
	userAddress: string
	chainId: number
	poolAddress: string
	newMaxLoanLength: string
}

export default function useSetMaxLoanLength({
	userAddress,
	chainId,
	poolAddress,
	newMaxLoanLength
}: ISetMaxLoanLength) {
	const txContext = useTxContext()

	const { chain } = useNetwork()

	const queryClient = useQueryClient()

	const { address } = useAccount()

	const config = chainConfig(chainId)

	const txConfirmingId = useRef<string>()

	const validMaxLoanLength =
		newMaxLoanLength && newMaxLoanLength !== '' ? new RegExp('^[0-9]*[.,]?[0-9]*$').test(newMaxLoanLength) : false

	const { config: contractConfig } = usePrepareContractWrite({
		addressOrName: poolAddress,
		contractInterface: config.poolABI,
		functionName: 'setMaxLoanLength',
		args: formatMaxLoanLength(validMaxLoanLength ? newMaxLoanLength : '0'),
		enabled: chain?.id === chainId && address?.toLowerCase() === userAddress?.toLowerCase() && validMaxLoanLength
	})

	const contractWrite = useContractWrite({
		...contractConfig,
		onSuccess: (data) => {
			txContext.hash!.current = data.hash
			txContext.dialog?.toggle()

			txConfirmingId.current = txConfirming({ txHash: data.hash, blockExplorer: config.blockExplorer })
		}
	})

	const waitForTransaction = useWaitForTransaction({
		hash: contractWrite.data?.hash,
		onSettled: (data) => {
			toast.dismiss(txConfirmingId.current)

			if (data?.status === 1) {
				txSuccess({
					txHash: contractWrite.data?.hash ?? '',
					blockExplorer: config.blockExplorer,
					content: 'Transaction Success'
				})
			} else {
				txError({ txHash: contractWrite.data?.hash ?? '', blockExplorer: config.blockExplorer })
			}

			queryClient.invalidateQueries()
		}
	})

	return {
		...contractWrite,
		waitForTransaction
	}
}
