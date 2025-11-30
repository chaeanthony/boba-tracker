// State
let selectedRating = 0;

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
	const toggleBtn = document.getElementById("toggle-review-btn");
	const formContainer = document.getElementById("review-form-container");
	const form = document.querySelector("#review-form-container form");
	const cancelBtn = document.getElementById("cancel-review-btn");
	const stars = document.querySelectorAll(".star");
	const commentInput = document.getElementById("comment-input");
	const ratingInput = document.getElementById("rating-input");

	if (!form) return; // No form on page (user not logged in)

	// Get initial rating if editing
	if (ratingInput.value) {
		selectedRating = parseInt(ratingInput.value, 10);
		highlightStars(selectedRating);
	}

	// Toggle form visibility
	toggleBtn.addEventListener("click", () => {
		formContainer.classList.toggle("show");
	});

	// Cancel button
	cancelBtn.addEventListener("click", () => {
		formContainer.classList.remove("show");
	});

	// Star rating interactions
	stars.forEach((star) => {
		star.addEventListener("click", () => {
			selectedRating = parseInt(star.dataset.rating, 10);
			ratingInput.value = selectedRating;
			highlightStars(selectedRating);
		});
	});

	// Character counter
	commentInput.addEventListener("input", updateCharCounter);

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		if (selectedRating === 0) {
			alert("Please select a rating");
			return;
		}

		const comment = commentInput.value.trim();
		if (!comment) {
			alert("Please enter a comment");
			return;
		}

		// Check if this is an edit (review_id exists) or create (no review_id)
		const reviewIdInput = form.querySelector('input[name="review_id"]');
		const storeIdInput = form.querySelector('input[name="store_id"]');

		const isEdit = reviewIdInput && reviewIdInput.value;

		// Prepare request
		const url = isEdit
			? `/api/reviews/${reviewIdInput.value}`
			: "/api/reviews";
		const method = isEdit ? "PATCH" : "POST";
		const body = isEdit
			? { rating: selectedRating, comment }
			: { store_id: storeIdInput.value, rating: selectedRating, comment };

		try {
			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify(body),
			});

			const data = await response.json();

			if (!response.ok) {
				alert(data.error || "Failed to submit review");
				return;
			}

			// Success - reload page to show updated review
			window.location.reload();
		} catch (error) {
			console.error("Error submitting review:", error);
			alert("An error occurred. Please try again.");
		}
	});
});

function highlightStars(rating) {
	const stars = document.querySelectorAll(".star");
	stars.forEach((star, index) => {
		if (index < rating) {
			star.style.color = "gold";
		} else {
			star.style.color = "lightgray";
		}
	});
}

function updateCharCounter() {
	const commentInput = document.getElementById("comment-input");
	const charCounter = document.getElementById("char-counter");
	let length = commentInput.value.length;

	// Enforce max length
	if (length > 1000) {
		commentInput.value = commentInput.value.substring(0, 1000);
		length = 1000;
	}

	charCounter.textContent = `${length}/1000 characters`;
}
