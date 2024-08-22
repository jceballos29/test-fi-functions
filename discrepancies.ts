interface Period {
	startDate: string;
	endDate: string;
}

export const discrepancies = (idcs: Period[], rnts: Period[]) => {
	const getDaysFromPeriods = (periods: Period[]): string[] => {
		const allDays: string[] = [];

		periods.forEach((period) => {
			const startDate = new Date(period.startDate);
			const endDate = new Date(period.endDate);

			for (
				let date = new Date(startDate);
				date <= endDate;
				date.setDate(date.getDate() + 1)
			) {
				allDays.push(date.toISOString().split('T')[0]);
			}
		});

		return allDays;
	};
	const findUniqueDays = (
		array1: string[],
		array2: string[],
	): string[] => {
		// Convertir los arreglos a conjuntos para una búsqueda más eficiente
		const set1 = new Set(array1);
		const set2 = new Set(array2);

		// Utilizar filter para encontrar los elementos únicos
		const uniqueDays = [...array1, ...array2].filter((day) => {
			return !set1.has(day) || !set2.has(day);
		});

		return uniqueDays;
	};
	const filterDaysBeforeDate = (days: string[]): string[] => {
		// const limitDateObj = new Date(limitDate);
		const limitDateObj = new Date(
			new Date().getFullYear(),
			new Date().getMonth(),
			0,
		);

		return days.filter((day) => {
			const dayObj = new Date(day);
			return dayObj <= limitDateObj;
		});
	};
	const groupDaysIntoPeriods = (
		days: string[],
	): { startDate: string; endDate: string }[] => {
		if (!days.length) return [];

		days.sort(); // Asegurarse de que los días estén ordenados

		const periods: { startDate: string; endDate: string }[] = [];
		let currentPeriod = { startDate: days[0], endDate: days[0] };

		for (let i = 1; i < days.length; i++) {
			const prevDay = new Date(days[i - 1]);
			const currentDay = new Date(days[i]);

			const diffInDays = Math.ceil(
				(currentDay.getTime() - prevDay.getTime()) /
					(1000 * 60 * 60 * 24),
			);

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
	};
  const findDiscrepancies = (periods: Period[]): string => {
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

	const idcsDays = getDaysFromPeriods(idcs);
	const rntsDays = getDaysFromPeriods(rnts);
	const uniqueDays = findUniqueDays(idcsDays, rntsDays);
	const uniqueDaysBeforeLimit = filterDaysBeforeDate(uniqueDays);
	const periods = groupDaysIntoPeriods(uniqueDaysBeforeLimit);
	return  findDiscrepancies(periods);;
};
