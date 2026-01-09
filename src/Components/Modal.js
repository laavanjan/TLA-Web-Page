import React, { useRef, useEffect } from 'react';

function closeDialogEventListener(onClose, event) {
	const _dialog = event.target;
	if (!(_dialog instanceof HTMLDialogElement)) return;

	const rect = _dialog.getBoundingClientRect();
	if (rect.left > event.clientX ||
		rect.right < event.clientX ||
		rect.top > event.clientY ||
		rect.bottom < event.clientY
	) {
		_dialog.close();
		onClose();
	}
}

const Modal = ({ isOpen, onClose, children } = {
	isOpen: true,
	onClose: undefined,
	children: null
}) => {
	const dialogRef = useRef(null);
	const _closeListener = closeDialogEventListener.bind(null, onClose);

	useEffect(() => {
		const _dialog = dialogRef.current;
		if (!(_dialog instanceof HTMLDialogElement)) return;

		_dialog
			.addEventListener(
				'click',
				_closeListener,
				false
			);

		return function cleanup() {
			_dialog.removeEventListener("click", _closeListener, false);
		};
	}, []);

	useEffect(() => {
		const _dialog = dialogRef.current;
		if (!(_dialog instanceof HTMLDialogElement)) return;
		if (isOpen) {
			_dialog.showModal();
		} else {
			_dialog.close();
		}
	}, [isOpen]);

	return (
		<dialog ref={dialogRef}>
			{children}
		</dialog>
	);
};

export default Modal;