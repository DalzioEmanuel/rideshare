const rideOptions = document.querySelectorAll('.ride-option');
const requestButton = document.querySelector('#requestRide');
const destinationInput = document.querySelector('#destination');
const destinationChips = document.querySelectorAll('.destination-chip');
const destinationLabel = document.querySelector('.dropoff-label strong');
const toast = document.querySelector('#toast');
const scheduleButtons = document.querySelectorAll('[data-schedule-mode]');
const scheduleFields = document.querySelector('#scheduleFields');
const scheduledAt = document.querySelector('#scheduledAt');
const shareRide = document.querySelector('#shareRide');
const pagePanels = document.querySelectorAll('[data-page-panel]');
const pageLinks = document.querySelectorAll('.top-links [data-page]');
const profileButton = document.querySelector('#profileButton');
let toastTimeout;

function showToast(message) {
	toast.textContent = message;
	toast.classList.add('visible');
	window.clearTimeout(toastTimeout);
	toastTimeout = window.setTimeout(() => toast.classList.remove('visible'), 2600);
}

function toLocalDateTimeValue(date) {
	return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function updateBookingSummary() {
	const selectedRide = document.querySelector('.ride-option.selected');
	const shareDiscount = shareRide.checked;
	let selectedPrice = 0;

	rideOptions.forEach((ride) => {
		const basePrice = Number(ride.dataset.price);
		const price = shareDiscount ? Math.round(basePrice * 0.75 / 50) * 50 : basePrice;
		ride.querySelector('.ride-price strong').textContent = `${price.toLocaleString('pt-AO')} Kz`;
		if (ride === selectedRide) selectedPrice = price;
	});

	const action = scheduleFields.hidden ? 'Confirmar' : 'Agendar';
	requestButton.innerHTML = `<span>${action} ${selectedRide.dataset.ride}</span><span>${selectedPrice.toLocaleString('pt-AO')} Kz <b>→</b></span>`;
}

function showPageFromHash() {
	const requestedPage = window.location.hash.slice(1);
	const page = [...pagePanels].some((panel) => panel.dataset.pagePanel === requestedPage) ? requestedPage : 'ride';

	pagePanels.forEach((panel) => {
		panel.hidden = panel.dataset.pagePanel !== page;
	});
	pageLinks.forEach((link) => {
		const active = link.dataset.page === page;
		link.classList.toggle('active', active);
		if (active) link.setAttribute('aria-current', 'page');
		else link.removeAttribute('aria-current');
	});
}

window.addEventListener('hashchange', showPageFromHash);
showPageFromHash();
profileButton.addEventListener('click', () => {
	window.location.hash = 'account';
});

document.querySelectorAll('[data-toast]').forEach((button) => {
	button.addEventListener('click', () => showToast(button.dataset.toast));
});

scheduleButtons.forEach((button) => {
	button.addEventListener('click', () => {
		const shouldSchedule = button.dataset.scheduleMode === 'later';
		scheduleButtons.forEach((modeButton) => {
			const selected = modeButton === button;
			modeButton.classList.toggle('selected', selected);
			modeButton.setAttribute('aria-pressed', String(selected));
		});
		scheduleFields.hidden = !shouldSchedule;
		if (shouldSchedule) {
			const earliest = Date.now() + 30 * 60 * 1000;
			scheduledAt.min = toLocalDateTimeValue(new Date(earliest));
			if (!scheduledAt.value || new Date(scheduledAt.value).getTime() < earliest) {
				scheduledAt.value = toLocalDateTimeValue(new Date(Date.now() + 60 * 60 * 1000));
			}
		}
		updateBookingSummary();
	});
});

shareRide.addEventListener('change', updateBookingSummary);

rideOptions.forEach((option) => {
	option.addEventListener('click', () => {
		rideOptions.forEach((ride) => {
			const selected = ride === option;
			ride.classList.toggle('selected', selected);
			ride.setAttribute('aria-checked', String(selected));
		});

		updateBookingSummary();
	});
});

destinationChips.forEach((chip) => {
	chip.addEventListener('click', () => {
		destinationInput.value = chip.dataset.destination;
		destinationLabel.textContent = chip.dataset.destination;
	});
});

destinationInput.addEventListener('input', () => {
	destinationLabel.textContent = destinationInput.value || 'Escolha um destino';
});

requestButton.addEventListener('click', () => {
	const selectedRide = document.querySelector('.ride-option.selected');
	const price = selectedRide.querySelector('.ride-price strong').textContent;
	let timing = 'pedida';
	if (!scheduleFields.hidden) {
		const earliest = Date.now() + 30 * 60 * 1000;
		if (!scheduledAt.value || new Date(scheduledAt.value).getTime() < earliest) {
			scheduledAt.setCustomValidity('Escolha uma data e hora com pelo menos 30 minutos de antecedência.');
			scheduledAt.reportValidity();
			return;
		}
		scheduledAt.setCustomValidity('');
		timing = `agendada para ${new Date(scheduledAt.value).toLocaleString('pt-AO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`;
	}
	const sharing = shareRide.checked ? 'partilhada ' : '';
	showToast(`Viagem ${sharing}${selectedRide.dataset.ride} ${timing} para ${destinationInput.value || 'o destino escolhido'} · ${price}`);
});

updateBookingSummary();

document.querySelectorAll('.map-controls button').forEach((button) => {
		button.addEventListener('click', () => showToast(`${button.getAttribute('aria-label')} no mapa`));
});
