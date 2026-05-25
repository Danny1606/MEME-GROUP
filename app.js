const form = document.getElementById('postForm');
const postText = document.getElementById('postText');
const postAuthor = document.getElementById('postAuthor');
const postType = document.getElementById('postType');
const postImage = document.getElementById('postImage');
const eventFields = document.getElementById('eventFields');
const eventDate = document.getElementById('eventDate');
const eventTime = document.getElementById('eventTime');
const eventLocation = document.getElementById('eventLocation');
const feed = document.getElementById('feed');
const imagePreviewRow = document.getElementById('imagePreviewRow');
const imagePreview = document.getElementById('imagePreview');
const removeImage = document.getElementById('removeImage');
const clearForm = document.getElementById('clearForm');

const STORAGE_KEY = 'familyConnectFeed';
let posts = [];
let selectedImageData = null;

function createId() {
  return `family-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
}

function loadPosts() {
  const stored = localStorage.getItem(STORAGE_KEY);
  posts = stored ? JSON.parse(stored) : [];
  if (!posts.length) {
    posts = [
      {
        id: createId(),
        author: 'Grandma',
        type: 'post',
        text: 'Welcome to our family garden! Share your favorite memory with everyone.',
        createdAt: Date.now() - 1000 * 60 * 60 * 6,
        image: '',
        eventDate: '',
        eventTime: '',
        eventLocation: '',
        comments: [
          { id: createId(), name: 'Aunty Joy', text: 'This is such a lovely idea!' }
        ]
      },
      {
        id: createId(),
        author: 'Dad',
        type: 'event',
        text: 'Family picnic at the lake this Sunday. Bring your favorite dish!',
        createdAt: Date.now() - 1000 * 60 * 60 * 2,
        image: '',
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().slice(0, 10),
        eventTime: '11:00',
        eventLocation: 'Sunrise Lake Park',
        comments: []
      }
    ];
    savePosts();
  }
}

function savePosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function renderFeed() {
  feed.innerHTML = '';
  if (!posts.length) {
    feed.innerHTML = '<p class="micro-copy">No family updates yet. Add the first post!</p>';
    return;
  }

  posts.slice().reverse().forEach(post => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">
          <strong>${post.author}</strong>
          <span class="card-meta">${formatTime(post.createdAt)}</span>
        </div>
        <span class="badge">${post.type === 'event' ? 'Event' : 'Post'}</span>
      </div>
      <div class="card-body">
        <p>${post.text.replace(/\n/g, '<br>')}</p>
        ${post.image ? `<img class="post-image" src="${post.image}" alt="Family post image" />` : ''}
        ${post.type === 'event' ? `
          <div class="event-details">
            <div class="detail-item"><strong>Date</strong><span>${post.eventDate || 'TBD'}</span></div>
            <div class="detail-item"><strong>Time</strong><span>${post.eventTime || 'TBD'}</span></div>
            <div class="detail-item"><strong>Where</strong><span>${post.eventLocation || 'TBD'}</span></div>
          </div>
        ` : ''}
        <div class="card-actions">
          <button type="button" data-action="edit" data-id="${post.id}" class="ghost-btn">Edit</button>
          <button type="button" data-action="delete" data-id="${post.id}" class="ghost-btn">Delete</button>
        </div>
        <div class="comment-section">
          <div class="comment-input-row">
            <input type="text" id="comment-${post.id}" placeholder="Write a comment..." />
            <button type="button" data-action="comment" data-id="${post.id}">Send</button>
          </div>
          <div class="comment-list">
            ${post.comments.map(comment => `
              <div class="comment-item">
                <strong>${comment.name}</strong>
                <p>${comment.text}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    feed.appendChild(card);
  });
}

function resetForm() {
  postText.value = '';
  postAuthor.value = 'Family Member';
  postType.value = 'post';
  eventFields.classList.add('hidden');
  eventDate.value = '';
  eventTime.value = '';
  eventLocation.value = '';
  postImage.value = '';
  selectedImageData = null;
  imagePreviewRow.classList.add('hidden');
  imagePreview.src = '';
}

function handleFormSubmit(event) {
  event.preventDefault();
  const text = postText.value.trim();
  const author = postAuthor.value.trim() || 'Family Member';
  const type = postType.value;

  if (!text) {
    alert('Please write a message to share with family.');
    return;
  }

  if (type === 'event' && !eventDate.value) {
    alert('Please choose a date for the event.');
    return;
  }

  const newPost = {
    id: createId(),
    author,
    type,
    text,
    createdAt: Date.now(),
    image: selectedImageData || '',
    eventDate: eventDate.value,
    eventTime: eventTime.value,
    eventLocation: eventLocation.value,
    comments: []
  };

  posts.push(newPost);
  savePosts();
  renderFeed();
  resetForm();
}

function handlePostTypeChange() {
  if (postType.value === 'event') {
    eventFields.classList.remove('hidden');
  } else {
    eventFields.classList.add('hidden');
  }
}

function handleImageUpload() {
  const file = postImage.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    selectedImageData = reader.result;
    imagePreview.src = selectedImageData;
    imagePreviewRow.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function handleRemoveImage() {
  selectedImageData = null;
  imagePreview.src = '';
  imagePreviewRow.classList.add('hidden');
  postImage.value = '';
}

function handleFeedClick(event) {
  const action = event.target.dataset.action;
  const postId = event.target.dataset.id;
  if (!action || !postId) return;

  if (action === 'delete') {
    posts = posts.filter(post => post.id !== postId);
    savePosts();
    renderFeed();
  }

  if (action === 'edit') {
    const post = posts.find(item => item.id === postId);
    if (!post) return;
    postText.value = post.text;
    postAuthor.value = post.author;
    postType.value = post.type;
    handlePostTypeChange();
    eventDate.value = post.eventDate || '';
    eventTime.value = post.eventTime || '';
    eventLocation.value = post.eventLocation || '';
    selectedImageData = post.image || null;
    if (selectedImageData) {
      imagePreview.src = selectedImageData;
      imagePreviewRow.classList.remove('hidden');
    }
    posts = posts.filter(item => item.id !== postId);
    savePosts();
    renderFeed();
  }

  if (action === 'comment') {
    const input = document.getElementById(`comment-${postId}`);
    if (!input) return;
    const commentText = input.value.trim();
    if (!commentText) return;

    const post = posts.find(item => item.id === postId);
    if (!post) return;
    post.comments.push({ id: createId(), name: 'Family Member', text: commentText });
    savePosts();
    renderFeed();
  }
}

function init() {
  loadPosts();
  renderFeed();
  handlePostTypeChange();

  form.addEventListener('submit', handleFormSubmit);
  postType.addEventListener('change', handlePostTypeChange);
  postImage.addEventListener('change', handleImageUpload);
  removeImage.addEventListener('click', handleRemoveImage);
  clearForm.addEventListener('click', resetForm);
  feed.addEventListener('click', handleFeedClick);
}

window.addEventListener('DOMContentLoaded', init);
