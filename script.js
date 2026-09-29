const rideOptions = document.querySelectorAll('.ride-option');
const requestButton = document.querySelector('#requestRide');
const destinationInput = document.querySelector('#destination');
const destinationChips = document.querySelectorAll('.destination-chip');
const destinationLabel = document.querySelector('.dropoff-label strong');
const toast = document.querySelector('#toast');
let toastTimeout;

function showToast(message) {
	toast.textContent = message;
	toast.classList.add('visible');
	window.clearTimeout(toastTimeout);
	toastTimeout = window.setTimeout(() => toast.classList.remove('visible'), 2600);
}

rideOptions.forEach((option) => {
	option.addEventListener('click', () => {
		rideOptions.forEach((ride) => {
			const selected = ride === option;
			ride.classList.toggle('selected', selected);
			ride.setAttribute('aria-checked', String(selected));
		});

		requestButton.innerHTML = `<span>Confirmar ${option.dataset.ride}</span><span>${option.dataset.price} <b>→</b></span>`;
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
	showToast(`Viagem ${selectedRide.dataset.ride} pedida para ${destinationInput.value || 'o destino escolhido'}`);
});

document.querySelectorAll('.map-controls button').forEach((button) => {
		button.addEventListener('click', () => showToast(`${button.getAttribute('aria-label')} no mapa`));
});
