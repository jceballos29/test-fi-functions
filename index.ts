console.log('Test Functions');

const contracts: any[] = [
	{
		resourceId: 'cd47a3be-b254-42a3-918c-0878bc69ac34',
		number: 1,
		contractTypeId: 189,
		contractType: null,
		startDate: '2024-01-01T00:00:00',
		endDate: '2024-05-31T00:00:00',
		workingDayType: 0,
		workHours: 0,
		partialJourneyPercent: 0,
	},
	{
		resourceId: 'cd47a3be-b254-42a3-918c-0878bc69ac34',
		number: 2,
		contractTypeId: 189,
		contractType: null,
		startDate: '2024-07-01T00:00:00',
		endDate: '2024-08-31T00:00:00',
		workingDayType: 0,
		workHours: 0,
		partialJourneyPercent: 0,
	},
];

const periods: any[] = [
	{
		resourceId: 'cd47a3be-b254-42a3-918c-0878bc69ac34',
		number: 1,
		startDate: '2024-01-01T00:00:00',
		endDate: '2024-06-30T00:00:00',
		modifiedBy: null,
		modifiedByEmail: null,
		modifiedDate: null,
	},
	{
		resourceId: 'cd47a3be-b254-42a3-918c-0878bc69ac34',
		number: 2,
		startDate: '2024-08-01T00:00:00',
		endDate: '2024-08-31T00:00:00',
		modifiedBy: null,
		modifiedByEmail: null,
		modifiedDate: null,
	},
];

const idcPeriods: any[] = [
	{
		id: '00000000-0000-0000-0000-000000000000',
		resourceId: null,
		resource: null,
		name: 'RESOURCE TEST',
		nss: '30 741852964',
		ccc: '159753456',
		startDate: '2024-01-01T00:00:00',
		endDate: '2024-01-31T00:00:00',
		companyName: '100M MONTADITOS INTERNACIONAL, S.L.',
	},
	{
		id: '00000000-0000-0000-0000-000000000000',
		resourceId: null,
		resource: null,
		name: 'RESOURCE TEST',
		nss: '30 741852964',
		ccc: '159753456',
		startDate: '2024-02-01T00:00:00',
		endDate: '2024-02-29T00:00:00',
		companyName: '100M MONTADITOS INTERNACIONAL, S.L.',
	},
	{
		id: '00000000-0000-0000-0000-000000000000',
		resourceId: null,
		resource: null,
		name: 'RESOURCE TEST',
		nss: '30 741852964',
		ccc: '159753456',
		startDate: '2024-03-01T00:00:00',
		endDate: '2024-03-31T00:00:00',
		companyName: '100M MONTADITOS INTERNACIONAL, S.L.',
	},
];

interface ValidationResult {
	show: boolean;
	message: string | null;
}

const checkPeriods = (contracts: any, periods: any) => {
	let result = false;
	if (contracts.length === 0 && periods.length === 0) {
		result = true;
	}

	if (contracts.length === 0 && periods.length > 0) {
		result = true;
	}

	if (contracts.length > 0 && periods.length > 0) {
		contracts.sort(
			(a: any, b: any) =>
				new Date(a.startDate).getTime() -
				new Date(b.startDate).getTime(),
		);
		periods.sort(
			(a: any, b: any) =>
				new Date(a.startDate).getTime() -
				new Date(b.startDate).getTime(),
		);

		const firstPeriod = new Date(periods[0].startDate);
		const firstContract = new Date(contracts[0].startDate);

		if (firstPeriod.getTime() < firstContract.getTime()) {
			result = true;
		}

		const lastPeriod = periods[periods.length - 1].endDate
			? new Date(periods[periods.length - 1].endDate)
			: null;
		const lastContract = contracts[contracts.length - 1].endDate
			? new Date(contracts[contracts.length - 1].endDate)
			: null;

		if (
			(lastContract && !lastPeriod) ||
			(lastContract &&
				lastPeriod &&
				lastContract.getTime() < lastPeriod.getTime())
		) {
			result = true;
		}

		const gaps = contracts.reduce(
			(acc: any, contract: any, index: number) => {
				const nextContract = contracts[index + 1];
				if (nextContract) {
					const contractEndDate = new Date(contract.endDate!);
					const nextContractStartDate = new Date(
						nextContract.startDate,
					);
					const gap =
						nextContractStartDate.getTime() -
						contractEndDate.getTime();
					if (gap > 86400000) {
						const gapStatDate = new Date(
							contractEndDate.getTime() + 86400000,
						);
						const gapEndDate = new Date(
							nextContractStartDate.getTime() - 86400000,
						);
						acc.push({
							startDate: gapStatDate.toISOString().split('T')[0],
							endDate: gapEndDate.toISOString().split('T')[0],
						});
					}
				} else if (contract.endDate) {
					const contractDate = new Date(contract.endDate);
					acc.push({
						startDate: new Date(contractDate.getTime() + 86400000)
							.toISOString()
							.split('T')[0],
						endDate: null,
					});
				}
				return acc;
			},
			[],
		);

		if (gaps.length > 0) {
			result = gaps.some((gap: any) => {
				const gapStartDate = new Date(gap.startDate);
				const gapEndDate = gap.endDate ? new Date(gap.endDate) : null;

				return periods.some((period: any) => {
					const periodStartDate = new Date(period.startDate);
					const periodEndDate = period.endDate
						? new Date(period.endDate)
						: null;

					if (
						gapStartDate.getTime() >= periodStartDate.getTime() &&
						(!periodEndDate || gapStartDate <= periodEndDate)
					) {
						return true;
					}
					if (
						gapEndDate &&
						gapEndDate >= periodStartDate &&
						(!periodEndDate || gapEndDate <= periodEndDate)
					) {
						return true;
					}
					return false;
				});
			});
		}
	}

	return {
		show: result,
		message: result
			? 'The contract periods entered for the researcher do not cover the bonus periods.'
			: '',
	};
};

const checkIdcPeriods = (periods: any, idcPeriods: any) => {
	console.log('------- Check IDC Periods --------');

	if (periods.length === 0 && idcPeriods.length === 0) {
		return {
			show: false,
			message: null,
		};
	}

	idcPeriods
		.map((idcPeriod: any) => {
			return {
				...idcPeriod,
				startDate: new Date(idcPeriod.startDate),
				endDate: new Date(idcPeriod.endDate),
			};
		})
		.sort((a: any, b: any) => a.startDate - b.startDate);

	periods
		.map((period: any) => {
			return {
				...period,
				startDate: new Date(period.startDate),
				endDate: new Date(period.endDate),
			};
		})
		.sort((a: any, b: any) => a.startDate - b.startDate);

	const interception = (p1: any, p2: any) => {
		return p1.startDate <= p2.endDate && p2.startDate <= p1.endDate;
	};

  const dateBetween = (start: any, end: any) => {
    const dates: Date[] = [];
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      console.log('Date', date);
      dates.push(new Date(date));
    }
    return dates;
  }

  const periodsDays = periods.flatMap((p: any) => dateBetween(p.startDate, p.endDate));
  const idcPeriodsDays = idcPeriods.flatMap((p: any) => dateBetween(p.startDate, p.endDate));

  const result = [...new Set([...periodsDays, ...idcPeriodsDays])].filter((day: any) => !periodsDays.includes(day) || !idcPeriodsDays.includes(day));

  console.log('Periods Days', periodsDays);
  console.log('IDC Periods Days', idcPeriodsDays);
  console.log('Result', result);

	return {
		show: false,
		message: null,
	};
};

const periodResult = checkPeriods(contracts, periods);
const idcPeriodResult = checkIdcPeriods(periods, idcPeriods);

const notices = {
	periods: periodResult,
	idcPeriods: idcPeriodResult,
};

const falsy = Object.values(notices).every(
	(notice: ValidationResult) => {
		return !notice.show;
	},
);

const react = Object.keys(notices).map((notice) => {
	let value = notices[notice as 'periods' | 'idcPeriods'];
	return value.show ? value.message : null;
});
console.log('########### Result #############');
console.log({
	notices,
	falsy,
	react,
});
