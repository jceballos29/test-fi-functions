import { discrepancies } from './discrepancies';
console.log('discrepancies between idcs and rnts');
console.log('-------------------');

interface Period {
	startDate: string;
	endDate: string;
}

const contracts: Period[] = [
	{
		startDate: '2024-02-01T00:00:00',
		endDate: '2024-05-31T00:00:00',
	},
	{
		startDate: '2024-07-01T00:00:00',
		endDate: '2024-08-31T00:00:00',
	},
];

const periods: Period[] = [
	{
		startDate: '2024-01-01T00:00:00',
		endDate: '2024-06-30T00:00:00',
	},
	{
		startDate: '2024-08-01T00:00:00',
		endDate: '2024-08-31T00:00:00',
	},
];

const idcs: Period[] = [
	// {
	// 	startDate: '2024-01-01T00:00:00',
	// 	endDate: '2024-01-31T00:00:00',
	// },
	{
		startDate: '2024-02-01T00:00:00',
		endDate: '2024-02-29T00:00:00',
	},
	{
		startDate: '2024-03-01T00:00:00',
		endDate: '2024-03-31T00:00:00',
	},
	{
		startDate: '2024-04-01T00:00:00',
		endDate: '2024-04-30T00:00:00',
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

const periodResult = checkPeriods(contracts, periods);

const notices = {
	periods: periodResult,
	idcPeriods: { show: false, message: null },
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


function getDaysFromPeriods(periods: Period[]): string[] {
  const allDays: string[] = [];

  periods.forEach(period => {
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      allDays.push(date.toISOString().split('T')[0]);
    }
  });

  return allDays;
}

function findUniqueDays(array1: string[], array2: string[]): string[] {
  // Convertir los arreglos a conjuntos para una búsqueda más eficiente
  const set1 = new Set(array1);
  const set2 = new Set(array2);

  // Utilizar filter para encontrar los elementos únicos
  const uniqueDays = [...array1, ...array2].filter(day => {
    return !set1.has(day) || !set2.has(day);
  });

  return uniqueDays;
}

function filterDaysBeforeDate(days: string[]): string[] {
  // const limitDateObj = new Date(limitDate);
	const limitDateObj = new Date(
		new Date().getFullYear(),
		new Date().getMonth(),
		0,
	)

  return days.filter(day => {
    const dayObj = new Date(day);
    return dayObj <= limitDateObj;
  });
}

function groupDaysIntoPeriods(days: string[]): { startDate: string; endDate: string }[] {
  if (!days.length) return [];

  days.sort(); // Asegurarse de que los días estén ordenados

  const periods: { startDate: string; endDate: string }[] = [];
  let currentPeriod = { startDate: days[0], endDate: days[0] };

  for (let i = 1; i < days.length; i++) {
    const prevDay = new Date(days[i - 1]);
    const currentDay = new Date(days[i]);

	const diffInDays = Math.ceil((currentDay.getTime() - prevDay.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 1) {
      // Si los días son consecutivos, actualizamos el endDate del período actual
      currentPeriod.endDate = days[i];
    } else {
      // Si no son consecutivos, agregamos el período actual a la lista y comenzamos uno nuevo
      periods.push(currentPeriod);
      currentPeriod = { startDate: days[i], endDate: days[i] };
    }
  }

  // Agregar el último período a la lista
  periods.push(currentPeriod);

  return periods;
}
function findDiscrepancies(periods: Period[]): string {
  const discrepancies: string[] = [];

  periods.forEach(period => {
    if (period.startDate !== period.endDate) {
      discrepancies.push(`${period.startDate}/${period.endDate}`);
    }
		if (period.startDate === period.endDate) {
			discrepancies.push(`${period.startDate}`);
		}
  });

  if (discrepancies.length > 0) {
    return `Se encontraron discrepancias en ${discrepancies.join(', ')}`;
  } else {
    return 'No se encontraron discrepancias.';
  }
}



const rntDays = getDaysFromPeriods([{
	startDate: '2024-01-01T00:00:00',
	endDate: '2024-01-03T00:00:00',
},
{
	startDate: '2024-08-01T00:00:00',
	endDate: '2024-08-03T00:00:00',
}]);
const idcDays = getDaysFromPeriods([
	{
		startDate: '2024-01-01T00:00:00',
		endDate: '2024-01-05T00:00:00',
	},
	{
		startDate: '2024-07-31T00:00:00',
		endDate: '2024-08-05T00:00:00',
	},
])
// const rntDays = getDaysFromPeriods(rnts);
// const idcDays = getDaysFromPeriods(idcs);
const uniqueDays = findUniqueDays(rntDays, idcDays);
const filteredDays = filterDaysBeforeDate(uniqueDays);
const uniquePeriods = groupDaysIntoPeriods(uniqueDays);
const message = findDiscrepancies(uniquePeriods);

const checkedIdcPeriods = discrepancies(idcs, periods);
const checkedPeriods = discrepancies(contracts, periods);
console.log('Periods vs IDC Periods: ', checkedIdcPeriods);
console.log('Periods vs Contracts: ', checkedPeriods);