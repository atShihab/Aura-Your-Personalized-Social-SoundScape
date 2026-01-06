type FavoritesEventListener = () => void;

class FavoritesEventEmitter {
	private listeners: FavoritesEventListener[] = [];

	subscribe(listener: FavoritesEventListener) {
		this.listeners.push(listener);
		
		// Return unsubscribe function
		return () => {
			const index = this.listeners.indexOf(listener);
			if (index > -1) {
				this.listeners.splice(index, 1);
			}
		};
	}

	emit() {
		this.listeners.forEach(listener => listener());
	}
}

export const favoritesEvents = new FavoritesEventEmitter();

