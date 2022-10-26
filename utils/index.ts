import BigNumber from 'bignumber.js'
import * as dayjs from 'dayjs'
import * as relativeTime from 'dayjs/plugin/relativeTime'
import { SECONDS_IN_A_DAY, SECONDS_IN_A_YEAR } from '~/lib/constants'

// @ts-ignore
dayjs.extend(relativeTime)

// returns item quote price in 'ether'
export function getQuotePrice({ oraclePrice, ltv }: { oraclePrice: number; ltv: number }) {
	return new BigNumber(oraclePrice).times(ltv).div(1e18).div(1e18).toFixed(4)
}

// returns currentAnnualInterest
export function formatCurrentAnnualInterest(currentAnnualInterest: number) {
	return (currentAnnualInterest / 1e16).toFixed(2)
}

// returns currentAnnualInterest arg that is passed in a contracts method
export function getTotalReceivedArg({
	oraclePrice,
	noOfItems,
	ltv
}: {
	oraclePrice: number
	noOfItems: number
	ltv: number
}) {
	return new BigNumber(oraclePrice).times(noOfItems).times(ltv).div(1e18).toFixed(0)
}

interface IFormArgs {
	nftAddress: string
	name: string
	symbol: string
	maxPrice: number
	maxDailyBorrows: number
	maxLengthInDays: number
	maximumInterest: number
	minimumInterest: number
	ltv: number
}

// returns formatted args that are passed to createPool() method
export function formatCreatePoolFormInputs({
	nftAddress,
	name,
	symbol,
	maxPrice,
	maxDailyBorrows,
	maxLengthInDays,
	maximumInterest,
	minimumInterest,
	ltv
}: IFormArgs) {
	const maxInt = Number(new BigNumber(maximumInterest / 100).times(1e18).div(SECONDS_IN_A_YEAR).toFixed(0))

	const minInt = Number(new BigNumber(minimumInterest / 100).times(1e18).div(SECONDS_IN_A_YEAR).toFixed(0))

	return {
		maxPrice: new BigNumber(maxPrice).times(1e18).toFixed(0),
		nftAddress,
		maxDailyBorrows: new BigNumber(maxDailyBorrows).times(1e18).toFixed(0),
		name,
		symbol,
		maxLength: (maxLengthInDays * SECONDS_IN_A_DAY).toFixed(0),
		maxVariableInterestPerEthPerSecond: (maxInt - minInt).toFixed(0),
		minimumInterest: new BigNumber(minimumInterest / 100).times(1e18).div(SECONDS_IN_A_YEAR).toFixed(0),
		ltv: new BigNumber(ltv).times(1e16).toFixed(0)
	}
}

export const formatLtv = (ltv: string) => new BigNumber(ltv).times(1e16).toFixed(0)
export const formatMaxPrice = (maxPrice: string) => new BigNumber(maxPrice).times(1e18).toFixed(0)
export const formatAmountToDepositOrWithdraw = (maxPrice: string) => new BigNumber(maxPrice).times(1e18).toFixed(0)
export const formatMaxDailyBorrows = (maxDailyBorrows: string) => new BigNumber(maxDailyBorrows).times(1e18).toFixed(0)
export const formatMaxLoanLength = (maxLengthInDays: string) => (Number(maxLengthInDays) * SECONDS_IN_A_DAY).toFixed(0)
export const formateInterestChange = (
	minimumInterest: number,
	maximumInterest: number,
	isInvalidInterests: boolean
) => {
	if (isInvalidInterests) {
		return [0, 0]
	}

	const maxInt = Number(new BigNumber(maximumInterest / 100).times(1e18).div(SECONDS_IN_A_YEAR).toFixed(0))

	const minInt = Number(new BigNumber(minimumInterest / 100).times(1e18).div(SECONDS_IN_A_YEAR).toFixed(0))

	return [
		(maxInt - minInt).toFixed(0),
		new BigNumber(minimumInterest / 100).times(1e18).div(SECONDS_IN_A_YEAR).toFixed(0)
	]
}

// returns 66% of an nft's oracle price that is populated in create pool form's maxPricePerNft input field
export function getMaxPricePerNft({ oraclePrice, ltv }: { oraclePrice?: number | null; ltv?: number | null }) {
	if (!oraclePrice || !ltv) {
		return ''
	}

	const ltvRatio = ltv / 100

	return (((oraclePrice / 1e18) * (1 / ltvRatio + 1)) / 2).toFixed(4)
}

// returns maximum no.of nfts a user can borrow based on pool balance
export function getMaxNftsToBorrow({
	maxInstantBorrow,
	oraclePrice,
	ltv
}: {
	maxInstantBorrow: number
	oraclePrice: number
	ltv: number
}) {
	if (!maxInstantBorrow || !oraclePrice || !ltv) {
		return 0
	}

	return Number((maxInstantBorrow / (oraclePrice * (ltv / 1e18))).toFixed(0))
}

export function formatLoanDeadline(deadline: number) {
	const isExpired = deadline - Date.now() <= 0 ? true : false

	// @ts-ignore
	return isExpired ? 'Expired' : dayjs(deadline).toNow(true)
}

export function getLoansPayableAmount(totalToRepay: number) {
	// add 5% buffer to totalToRepay
	const buffer = new BigNumber(totalToRepay).times(0.05).toFixed(0)

	return new BigNumber(totalToRepay).plus(buffer).toFixed(0)
}

export const gasLimitOverride = new BigNumber(0.0005).times(1e9).toFixed(0)
