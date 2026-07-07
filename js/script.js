document.addEventListener('DOMContentLoaded', () => {
    // URL Parsing
    const urlParams = new URLSearchParams(window.location.search);
    const bizId = urlParams.get('id');

    // DOM Elements
    const bizNameEl = document.getElementById('biz-name');
    const nfState = document.getElementById('nf-state');
    const starBlock = document.getElementById('star-block');
    const stars = document.querySelectorAll('.star');
    const starLbl = document.getElementById('star-lbl');
    const reviewBlock = document.getElementById('review-block');
    const genWrap = document.getElementById('gen-wrap');
    const revBox = document.getElementById('rev-box');
    const revText = document.getElementById('rev-text');
    const postBtn = document.getElementById('post-btn');
    const toast = document.getElementById('toast');

    let currentBizLink = '';

    // Reviews text generation based on stars
    const reviews = {
        1: "I had a very disappointing experience here. The service was below expectations and I wouldn't recommend it based on this visit.",
        2: "The experience was below average. There is definitely a lot of room for improvement.",
        3: "My experience was okay, nothing special but nothing terrible either. Just average.",
        4: "I had a good experience here! The service was solid and I would likely come back again.",
        5: "Absolutely fantastic! The service was excellent, and everything exceeded my expectations. Highly recommend!"
    };

    const starMessages = {
        1: "1 Star - We are sorry",
        2: "2 Stars - We will try to do better",
        3: "3 Stars - Thanks for your feedback",
        4: "4 Stars - We are glad you enjoyed it",
        5: "5 Stars - Thank you!"
    };

    // Fetch Data
    fetch('data/businesses.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Dynamic Update
            const business = data.find(b => b.id === bizId);

            if (business) {
                bizNameEl.textContent = business.name;
                currentBizLink = business.link;
            } else {
                // Invalid ID
                nfState.classList.remove('gone');
                starBlock.classList.add('gone');
                bizNameEl.textContent = "Unknown Business";
            }
        })
        .catch(error => {
            console.error('Error fetching businesses data:', error);
            nfState.classList.remove('gone');
            starBlock.classList.add('gone');
            bizNameEl.textContent = "Error loading data";
        });

    // Interaction Logic
    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            const rating = parseInt(e.target.getAttribute('data-r'));

            // Reset stars
            stars.forEach(s => {
                s.classList.remove('on', 'pop');
            });

            // Add classes to selected and previous stars
            stars.forEach(s => {
                const r = parseInt(s.getAttribute('data-r'));
                if (r <= rating) {
                    s.classList.add('on');
                    s.classList.add('pop'); 
                }
            });

            // Update label
            starLbl.textContent = starMessages[rating];

            // Show review block
            reviewBlock.classList.remove('gone');
            revBox.classList.add('gone'); // Hide text box initially if re-clicking
            genWrap.classList.remove('gone'); // Show generating skeleton
            postBtn.disabled = true;

            // Simulate 'generating' delay (2 seconds)
            setTimeout(() => {
                genWrap.classList.add('gone');
                revBox.classList.remove('gone');
                revText.textContent = reviews[rating];
                postBtn.disabled = false;
            }, 2000);
        });
    });

    // Copy & Post Action
    postBtn.addEventListener('click', () => {
        if (!postBtn.disabled) {
            // Copy text to clipboard
            const textToCopy = revText.textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Trigger a toast notification
                toast.classList.remove('gone');
                toast.classList.add('show');

                // After 2 seconds, redirect to Google link in new tab
                setTimeout(() => {
                    toast.classList.remove('show');
                    toast.classList.add('gone');
                    if (currentBizLink) {
                        window.open(currentBizLink, '_blank');
                    }
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        }
    });
});
