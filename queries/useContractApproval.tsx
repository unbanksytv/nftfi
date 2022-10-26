import { useQueryClient } from '@tanstack/react-query'
import {
	erc721ABI,
	useAccount,
	useContractRead,
	useContractWrite,
	useNetwork,
	usePrepareContractWrite,
	useWaitForTransaction
} from 'wagmi'
import { txError } from '~/components/TxToast'
import { chainConfig } from '~/lib/constants'

interface IContractApprovalProps {
	poolAddress: string
	nftContractAddress: string
	enabled: boolean
}

export function useSetContractApproval({ poolAddress, nftContractAddress, enabled }: IContractApprovalProps) {
	const { chain } = useNetwork()
	const queryClient = useQueryClient()

	const cConfig = chainConfig(chain?.id)

	const { config } = usePrepareContractWrite({
		addressOrName: nftContractAddress,
		contractInterface: erc721ABI,
		functionName: 'setApprovalForAll',
		args: [poolAddress, true],
		enabled
	})

	const contractWrite = useContractWrite(config)

	const waitForTransaction = useWaitForTransaction({
		hash: contractWrite.data?.hash,
		onSettled: (data) => {
			if (data?.status === 0) {
				txError({ txHash: contractWrite.data?.hash ?? '', blockExplorer: cConfig.blockExplorer })
			}
			queryClient.invalidateQueries()
		}
	})

	return { ...contractWrite, waitForTransaction }
}

export function useGetContractApproval({ poolAddress, nftContractAddress, enabled }: IContractApprovalProps) {
	const { address } = useAccount()

	return useContractRead({
		addressOrName: nftContractAddress,
		contractInterface: erc721ABI,
		functionName: 'isApprovedForAll',
		args: [address, poolAddress],
		enabled
	})
}
